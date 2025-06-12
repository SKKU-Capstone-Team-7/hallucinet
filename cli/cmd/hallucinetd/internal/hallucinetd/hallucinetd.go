package hallucinetd

import (
	"context"
	"encoding/binary"
	"encoding/json"
	"errors"
	"log"
	"net"
	"net/netip"
	"net/url"
	"os"
	"time"

	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/cmd/hallucinetd/internal/dns"
	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/internal/comms"
	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/internal/coordination"
	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/internal/docker"
	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/internal/routing"
	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/internal/utils"
	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/internal/vpn"
	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/types"
	"github.com/gorilla/websocket"
	"golang.zx2c4.com/wireguard/wgctrl/wgtypes"
)

var ErrUnknownWSMsg = errors.New("Unknown socket message")

type HallucinetDaemon struct {
	listener       *net.UnixListener
	config         types.Config
	dns            *dns.Dns
	coord          *coordination.Coord
	domon          *docker.DockerMonitor
	routeManager   *routing.RouteManager
	ws             *websocket.Conn
	Device         coordination.DeviceInfoDto
	running        bool
	RunningContext context.Context
	RunningCancel  context.CancelFunc
	key            wgtypes.Key
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

	return &daemon, nil
}

func (daemon *HallucinetDaemon) dockerListenLoop() error {
	for {
		select {
		case <-daemon.RunningContext.Done():
			return nil

		case event, ok := <-daemon.domon.EventChan:
			if !ok {
				return nil // channel closed
			}

			var wsMsg comms.WsMsg
			wsMsg.Data = comms.WsSendContEventPayload{
				Token: daemon.coord.JWT,
				Event: event,
			}

			dev, err := coordination.ParseDeviceInfoDto(daemon.Device)
			if err != nil {
				log.Printf("Cannot parse device info. %v\n", err)
			}
			cont, err := utils.CreateContainerInfo(event.ContainerName, event.ContainerIP, dev)
			if err != nil {
				log.Printf("Cannot parse container info. %v\n", err)
			}

			switch event.ConvEventKind {
			case comms.EventContainerConnected:
				wsMsg.Event = "container_connected"
				daemon.dns.AddEntry(cont)
			case comms.EventContainerDisconnected:
				wsMsg.Event = "container_disconnected"
				daemon.dns.RemoveEntry(cont)
			case comms.EventUnknown:
				log.Printf("UNKNOWN: %v\n", event)
				return comms.ErrUnknownEvent
			}

			daemon.ws.WriteJSON(wsMsg)
		}
	}
}

func (daemon *HallucinetDaemon) handleDeviceSelf(payload comms.WsRecvDevSelfPayload) {
	// Create wireguard connection
	addr, err := netip.ParseAddr(payload.Address)
	if err != nil {
		log.Print("Cannot parse vpn address %v. %v\n", payload.Address, err)
	}
	serverKey, err := wgtypes.ParseKey(payload.PubKey)
	if err != nil {
		log.Print("Cannot parse server pubkey %v. %v\n", payload.PubKey, err)
	}
	vpn.SetupWireguardLink(daemon.config.VPNEndpoint, daemon.key, addr, serverKey)

	// Add own containers to DNS
	daemon.Device = payload.Device
	daemon.domon.CreateEventsChannel(daemon.Device)
	containers, err := daemon.domon.GetDeviceContainers()
	if err != nil {
		log.Printf("Cannot get device containers. %v\n", err)
	}
	for _, cont := range containers {
		dev, err := coordination.ParseDeviceInfoDto(daemon.Device)
		if err != nil {
			log.Printf("Cannot parse device info. %v\n", err)
		}
		cont, err := utils.CreateContainerInfo(cont.ContainerName, cont.ContainerIP, dev)
		if err != nil {
			log.Printf("Cannot parse container info. %v\n", err)
		}

		log.Printf("Adding entry: %v\n", cont)
		daemon.dns.AddEntry(cont)
	}

	go daemon.pingLoop()
	go daemon.dockerListenLoop()
}

func (daemon *HallucinetDaemon) handleTeamContainers(payload comms.WsRecvTeamContainersPayload) {
	for _, dto := range payload.Containers {
		cont, err := coordination.ParseContainerInfoDto(dto)
		if err != nil {
			log.Printf("Cannot parse container: %v.%v", dto.Name, dto.Device.Name)
		}
		daemon.dns.AddEntry(cont)
	}
}

func (daemon *HallucinetDaemon) handleDeviceConnected(payload comms.WsRecvDevConnectPayload) {
	log.Printf("Device connected: %v\n", payload)

	daemon.dns.RemoveDeviceContainers(payload.Device.Name)

	for _, dto := range payload.Containers {
		cont, err := coordination.ParseContainerInfoDto(dto)
		if err != nil {
			log.Printf("Cannot parse container dto: %v\n", err)
			continue
		}
		daemon.dns.AddEntry(cont)
	}

	device, err := coordination.ParseDeviceInfoDto(payload.Device)
	if err != nil {
		log.Printf("Cannot parse device info %v\n", err)
	}
	err = daemon.routeManager.AddRouteToDeviceSubnet(device)
	if err != nil {
		log.Printf("Skipped adding route to %v via %v. %v\n", device.Subnet, device, err)
	} else {
		log.Printf("Added route to %v via %v\n", device.Subnet, device)
	}
}

func (daemon *HallucinetDaemon) handleDeviceDisconnected(payload comms.WsRecvDevDisconnectPayload) {
	log.Printf("Device disconnected: %v\n", payload)

	for _, dto := range payload.Containers {
		cont, err := coordination.ParseContainerInfoDto(dto)
		if err != nil {
			log.Printf("Cannot parse container dto: %v\n", err)
			continue
		}
		daemon.dns.RemoveEntry(cont)
	}

	device, err := coordination.ParseDeviceInfoDto(payload.Device)
	if err != nil {
		log.Printf("Cannot parse device info %v\n", err)
	}
	err = daemon.routeManager.RemoveRouteToDeviceSubnet(device)
	if err != nil {
		log.Printf("Skipped removing route to %v via %v. %v\n", device.Subnet, device, err)
	} else {
		log.Printf("Removed route to %v via %v\n", device.Subnet, device)
	}
}

func (daemon *HallucinetDaemon) handleContainerConnected(payload comms.WsRecvContEventPayload) {
	cont, err := coordination.ParseContainerInfoDto(payload.Container)
	if err != nil {
		log.Printf("Cannot parse container connected event: %v", payload)
	}

	log.Printf("Container connected: %v\n", cont)
	err = daemon.dns.AddEntry(cont)
	if err != nil {
		log.Printf("Cannot remove DNS entry %v. %v\n", cont, err)
	}
}

func (daemon *HallucinetDaemon) handleContainerDisconnected(payload comms.WsRecvContEventPayload) {
	cont, err := coordination.ParseContainerInfoDto(payload.Container)
	if err != nil {
		log.Printf("Cannot parse container disconnected event: %v", payload)
	}

	log.Printf("Container disconnected: %v\n", cont)
	err = daemon.dns.RemoveEntry(cont)
	if err != nil {
		log.Printf("Cannot remove DNS entry %v. %v\n", cont, err)
	}
}

func (daemon *HallucinetDaemon) pingLoop() {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-daemon.RunningContext.Done():
			return
		case <-ticker.C:
			wsMsg := comms.WsMsg{
				Event: "ping",
				Data: struct {
					Token string `json:"token"`
				}{
					Token: daemon.coord.JWT,
				},
			}

			err := daemon.ws.WriteJSON(wsMsg)
			if err != nil {
				log.Printf("Ping write error: %v", err)
				return
			}
		}
	}
}

func (daemon *HallucinetDaemon) wsListenLoop() error {
	// Create websocket connection
	coordUrl, err := url.Parse(daemon.config.Endpoint)
	if err != nil {
		return err
	}
	u := url.URL{
		Scheme: "ws",
		Host:   coordUrl.Host,
		Path:   "/api/coordination/events",
	}

	c, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		return err
	}
	daemon.ws = c

	// Register device socket and send current state
	containers, err := daemon.domon.GetDeviceContainers()
	if err != nil {
		return err
	}
	key, err := wgtypes.GeneratePrivateKey()
	if err != nil {
		return err
	}

	var wsMsg comms.WsMsg
	wsMsg.Event = "device_connected"
	wsMsg.Data = comms.WsSendDevConnectPayload{
		Token:      daemon.coord.JWT,
		Containers: containers,
		PubKey:     key.PublicKey().String(),
	}
	err = daemon.ws.WriteJSON(wsMsg)
	if err != nil {
		return err
	}

	for {
		messageType, eventBytes, err := daemon.ws.ReadMessage()
		if err != nil {
			if daemon.running {
				log.Printf("Cannot read ws message: type %v msg %v\n", messageType, string(eventBytes))
				time.Sleep(1 * time.Second)
				continue
			} else {
				break
			}
		}
		// log.Printf("Got ws message: type %v msg %v\n", messageType, string(eventBytes))

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
		case "device_self":
			var payload comms.WsRecvDevSelfPayload
			err := json.Unmarshal(data, &payload)
			if err != nil {
				log.Printf("Cannot unmarshal device self payload: %v\n", err)
				log.Printf("%v\n", string(data))
				continue
			}
			daemon.handleDeviceSelf(payload)

		case "team_containers":
			var payload comms.WsRecvTeamContainersPayload
			err := json.Unmarshal(data, &payload)
			if err != nil {
				log.Printf("Cannot unmarshal team containers payload: %v\n", err)
				log.Printf("%v\n", string(data))
				continue
			}
			daemon.handleTeamContainers(payload)

		case "device_disconnected":
			var payload comms.WsRecvDevDisconnectPayload
			err := json.Unmarshal(data, &payload)
			if err != nil {
				log.Printf("Cannot unmarshal device disconnected payload: %v\n", err)
				continue
			}
			daemon.handleDeviceDisconnected(payload)

		case "device_connected":
			var payload comms.WsRecvDevConnectPayload
			err := json.Unmarshal(data, &payload)
			if err != nil {
				log.Printf("Cannot unmarshal device connected payload: %v\n", err)
				continue
			}
			daemon.handleDeviceConnected(payload)

		case "container_connected":
			var payload comms.WsRecvContEventPayload
			err := json.Unmarshal(data, &payload)
			if err != nil {
				log.Printf("Cannot unmarshal container connected payload: %v\n", err)
				continue
			}
			daemon.handleContainerConnected(payload)

		case "container_disconnected":
			var payload comms.WsRecvContEventPayload
			err := json.Unmarshal(data, &payload)
			if err != nil {
				log.Printf("Cannot unmarshal container disconnected payload: %v\n", err)
				continue
			}
			daemon.handleContainerDisconnected(payload)
		default:
			log.Printf("Unknown ws event: %v\n", wsMsg.Event)
		}

		daemon.dns.PrintEntries()
	}

	return nil
}

func (daemon *HallucinetDaemon) socketListenLoop() error {
	log.Printf("Listening on %v\n", daemon.config.HallucinetSocket)
	daemon.running = false

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

		log.Printf("Got message! %v\n", msg)
		switch msg.Header.Kind {
		case comms.MsgStartDaemon:
			log.Printf("Received start message.")
			if !daemon.running {

				if err != nil {
					return err
				}

				go daemon.startDns()
				go daemon.wsListenLoop()

				daemon.running = true
				ctx, cancel := context.WithCancel(context.Background())
				daemon.RunningContext = ctx
				daemon.RunningCancel = cancel
			}

		case comms.MsgStopDaemon:
			log.Printf("Received stop message.")
			if daemon.running {
				vpn.RemoveWireguardLink()
				daemon.domon.Close()
				daemon.ws.Close()
				daemon.stopDns()
				daemon.running = false
				daemon.RunningCancel()
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
	daemon.dns.ClearEntries()
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

func (daemon *HallucinetDaemon) Start() error {
	daemon.socketListenLoop()
	return nil
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
