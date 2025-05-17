package hallucinetd

import (
	"encoding/binary"
	"log"
	"net"
	"os"

	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/cmd/hallucinetd/internal/dns"
	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/internal/comms"
	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/internal/coordination"
	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/internal/routing"
	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/internal/utils"
	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/types"
)

type HallucinetDaemon struct {
	listener     *net.UnixListener
	config       types.Config
	dns          *dns.Dns
	coord        *coordination.Coord
	routeManager *routing.RouteManager
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

func (daemon *HallucinetDaemon) Close() error {
	err := daemon.listener.Close()
	if err != nil {
		return err
	}

	return nil
}

func (daemon *HallucinetDaemon) socketListenLoop() error {
	log.Printf("Listening on %v\n", daemon.config.HallucinetSocket)
	running := false

	for {
		log.Printf("here")
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
	daemon.socketListenLoop()
	return nil
}
