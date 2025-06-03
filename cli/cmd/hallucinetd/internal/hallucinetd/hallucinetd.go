package hallucinetd

import (
	"encoding/binary"
	"encoding/json"
	"errors"
	"log"
	"net"
	"net/url"
	"os"

	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/cmd/hallucinetd/internal/dns"
	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/internal/comms"
	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/internal/coordination"
	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/internal/docker"
	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/internal/routing"
	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/internal/utils"
	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/types"
	"github.com/gorilla/websocket"
)

var ErrUnknownWSMsg = errors.New("Unknown socket message")

type HallucinetDaemon struct {
	listener     *net.UnixListener
	config       types.Config
	dns          *dns.Dns
	coord        *coordination.Coord
	domon        *docker.DockerMonitor
	routeManager *routing.RouteManager
	ws           *websocket.Conn
}

func New(config types.Config) (*HallucinetDaemon, error) {
	daemon := HallucinetDaemon{
		config: config,
	}

	// Remove existing socket
	socketPath := config.HallucinetSocket
	fileInfo, _ := os.Stat(socketPath)
	if fileInfo != nil {
		err := os.Remove(socketPath)
		if err != nil {
			return nil, err
		}
	}

	// Create socket listener
	listener, err := net.ListenUnix("unix", &net.UnixAddr{
		Name: socketPath,
		Net:  "unix",
	})
	if err != nil {
		return nil, err
	}
	daemon.listener = listener

	// Create docker monitor
	domon, err := docker.New(config)
	if err != nil {
		return nil, err
	}
	daemon.domon = domon

	// Create dns server
	dns, err := dns.New(config)
	if err != nil {
		return nil, err
	}
	daemon.dns = dns

	// Create coordination object
	coord, err := coordination.New(config)
	if err != nil {
		return nil, err
	}
	daemon.coord = coord

	// Create route manager
	roma, err := routing.New(config)
	if err != nil {
		return nil, err
	}
	daemon.routeManager = roma

	// Create websocket connection
	coordUrl, err := url.Parse(config.Endpoint)
	if err != nil {
		return nil, err
	}
	u := url.URL{
		Scheme: "ws",
		Host:   coordUrl.Host,
		Path:   "/api/coordination/events",
	}
	log.Println(u.String())
	c, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		return nil, err
	}
	daemon.ws = c

	return &daemon, nil
}

func (daemon *HallucinetDaemon) Close() error {
	err := daemon.listener.Close()
	if err != nil {
		return err
	}

	err = daemon.ws.Close()
	if err != nil {
		return err
	}

	return nil
}

func (daemon *HallucinetDaemon) dockerListenLoop() error {
	for event := range daemon.domon.EventChan {
		var wsMsg comms.WsMsg
		wsMsg.Data = comms.WsContEventPayload{
			Token: daemon.coord.JWT,
			Event: event,
		}

		switch event.ConvEventKind {
		case comms.EventContainerConnected:
			wsMsg.Event = "container_connected"
		case comms.EventContainerDisconnected:
			wsMsg.Event = "container_disconnected"
		case comms.EventUnknown:
			log.Printf("UNKNOWN: %V\n", event)
			return comms.ErrUnknownEvent
		}

		daemon.ws.WriteJSON(wsMsg)
	}
	return nil
}

func (daemon *HallucinetDaemon) handleTeamContainers(payload comms.WsTeamContainersPayload) {
	for _, dto := range payload.Containers {
		cont, err := coordination.ParseContainerInfoDto(dto)
		if err != nil {
			log.Printf("Cannot parse container: %v.%v", dto.Name, dto.Device.Name)
		}
		daemon.dns.AddEntry(cont)
	}
}

func (daemon *HallucinetDaemon) handleDeviceConnected(payload comms.WsDevConnectPayload) {
}

func (daemon *HallucinetDaemon) handleDeviceDisconnected(payload comms.WsDevDisconnectPayload) {
}

func (daemon *HallucinetDaemon) handleContainerConnected(payload comms.WsContEventPayload) {
}

func (daemon *HallucinetDaemon) handleContainerDisconnected(payload comms.WsContEventPayload) {
}

func (daemon *HallucinetDaemon) wsListenLoop() error {
	for {
		messageType, eventBytes, err := daemon.ws.ReadMessage()
		if err != nil {
			log.Printf("Cannot read ws message: type %v msg %v\n", messageType, string(eventBytes))
			continue
		}

		wsMsg := comms.WsMsg{}
		err = json.Unmarshal(eventBytes, &wsMsg)
		if err != nil {
			log.Printf("Cannot unmarshal ws message: %v\n", err)
			continue
		}

		data, err := json.Marshal(wsMsg.Data)
		if err != nil {
			log.Printf("Cannot read data: %v\n", err)
			continue
		}

		switch wsMsg.Event {
		case "team_containers":
			var payload comms.WsTeamContainersPayload
			err := json.Unmarshal(data, &payload)
			if err != nil {
				log.Printf("Cannot unmarshal team containers payload: %v\n", err)
				log.Printf("%v\n", string(data))
				continue
			}
			daemon.handleTeamContainers(payload)

		case "device_disconnected":
			var payload comms.WsDevDisconnectPayload
			err := json.Unmarshal(data, &payload)
			if err != nil {
				log.Printf("Cannot unmarshal device disconnected payload: %v\n", err)
				continue
			}
			daemon.handleDeviceDisconnected(payload)

		case "device_connected":
			var payload comms.WsDevConnectPayload
			err := json.Unmarshal(data, &payload)
			if err != nil {
				log.Printf("Cannot unmarshal device connected payload: %v\n", err)
				continue
			}
			daemon.handleDeviceConnected(payload)

		case "container_connected":
			var payload comms.WsContEventPayload
			err := json.Unmarshal(data, &payload)
			if err != nil {
				log.Printf("Cannot unmarshal container connected payload: %v\n", err)
				continue
			}
			daemon.handleContainerConnected(payload)

		case "container_disconnected":
			var payload comms.WsContEventPayload
			err := json.Unmarshal(data, &payload)
			if err != nil {
				log.Printf("Cannot unmarshal container disconnected payload: %v\n", err)
				continue
			}
			daemon.handleContainerDisconnected(payload)
		default:
			log.Printf("Unknown ws event: %v\n", wsMsg.Event)
		}
	}

	return nil
}

func (daemon *HallucinetDaemon) socketListenLoop() error {
	log.Printf("Listening on %v\n", daemon.config.HallucinetSocket)
	running := false

	for {
		log.Printf("Accepting")
		conn, err := daemon.listener.AcceptUnix()
		if err != nil {
			return err
		}
		defer conn.Close()

		var msg comms.Msg
		err = binary.Read(conn, binary.NativeEndian, &msg.Header)
		if err != nil {
			return err
		}

		devices, err := daemon.coord.GetDevices()
		if err != nil {
			return err
		}

		containers, err := daemon.coord.GetContainers()
		if err != nil {
			return err
		}

		log.Printf("Message!")
		switch msg.Header.Kind {
		case comms.MsgStartDaemon:
			log.Printf("Received start message.")
			if !running {

				if err != nil {
					return err
				}

				daemon.addRoutesToDevices(devices)
				daemon.addDnsEntriesForContainers(containers)

				go daemon.startDns()
				running = true
			}

		case comms.MsgStopDaemon:
			log.Printf("Received stop message.")
			if running {
				daemon.stopDns()
				// TODO use runtime container, devices instead of initialize-time
				daemon.removeDnsentriesForContainers(containers)
				daemon.removeRoutesToDevices(devices)
				running = false
			}
		}
	}

	return nil
}

func (daemon *HallucinetDaemon) startDns() {
	log.Printf("Starting dns server at %v\n", daemon.config.DnsAddress.String())
	err := daemon.dns.Start()
	if err != nil {
		log.Printf("DNS server error: %v\n", err)
		return
	}
}

func (daemon *HallucinetDaemon) stopDns() {
	err := daemon.dns.Stop()
	if err != nil {
		log.Printf("Cannot stop DNS server", err)
		return
	}
	log.Printf("DNS server stopped.\n")
}

func (daemon *HallucinetDaemon) addRoutesToDevices(devices []types.DeviceInfo) error {
	// TODO Handle errors
	// TODO Skip own subnet
	for _, device := range devices {
		err := daemon.routeManager.AddRouteToDeviceSubnet(device)
		if err != nil {
			log.Printf("Skipped adding route to %v via %v. %v\n", device.Subnet, device, err)
		} else {
			log.Printf("Added route to %v via %v\n", device.Subnet, device)
		}
	}

	return nil
}

func (daemon *HallucinetDaemon) removeRoutesToDevices(devices []types.DeviceInfo) error {
	// TODO Handle errors
	for _, device := range devices {
		err := daemon.routeManager.RemoveRouteToDeviceSubnet(device)
		if err != nil {
			log.Printf("Skipped removing route to %v via %v. %v\n", device.Subnet, device, err)
		} else {
			log.Printf("Removed route to %v via %v\n", device.Subnet, device)
		}
	}

	return nil
}

func (daemon *HallucinetDaemon) addDnsEntriesForContainers(containers []types.ContainerInfo) error {
	// TODO Handle errors
	for _, container := range containers {
		err := daemon.dns.AddEntry(container)
		fqdn := daemon.dns.GetContainerFQDN(container)
		if err != nil {
			log.Printf("Skipped adding DNS entry for %v %v. %v\n", fqdn, container.Address, err)
		} else {
			log.Printf("Added DNS entry for %v %v\n", fqdn, container.Address)
		}
	}

	return nil
}

func (daemon *HallucinetDaemon) removeDnsentriesForContainers(containers []types.ContainerInfo) error {
	// TODO Handle errors
	for _, container := range containers {
		err := daemon.dns.RemoveEntry(container)
		fqdn := daemon.dns.GetContainerFQDN(container)
		if err != nil {
			log.Printf("Skipped removing DNS entry for %v %v. %v\n", fqdn, container.Address, err)
		} else {
			log.Printf("Removed DNS entry for %v %v\n", fqdn, container.Address)
		}
	}

	return nil
}

func (daemon *HallucinetDaemon) addContainersFromServer() {
	devices, err := daemon.coord.GetDevices()
	if err != nil {
		log.Printf("Cannot get container from server. %v\n", err)
	}

	deviceOne := devices[0]
	containerOne, err := utils.CreateContainerInfo("containerOne", "10.2.1.2", deviceOne)
	if err != nil {
		log.Printf("Error creating container info. %v\n", containerOne)
	}

	err = daemon.dns.AddEntry(containerOne)
	if err != nil {
		log.Printf("Error adding entry. %v\n", err)
	}
	log.Printf("Adding entry %v %v %v\n", deviceOne.Name, containerOne.Name, containerOne.Address)
}

func (daemon *HallucinetDaemon) Start() error {
	// Register device socket and send current state
	containers, err := daemon.domon.GetDeviceContainers()
	if err != nil {
		return err
	}

	var wsMsg comms.WsMsg
	wsMsg.Event = "device_connected"
	wsMsg.Data = comms.WsDevConnectPayload{
		Token:      daemon.coord.JWT,
		Containers: containers,
	}
	daemon.ws.WriteJSON(wsMsg)

	go func() {
		daemon.startDns()
		defer daemon.stopDns()
	}()

	go func() {
		daemon.socketListenLoop()
	}()
	go func() {
		daemon.wsListenLoop()
	}()

	daemon.dockerListenLoop()

	return nil
}
