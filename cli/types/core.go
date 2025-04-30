package types

import (
	"net"
	"net/netip"
)

type DeviceInfo struct {
	Name    string     `json:"name"`
	Subnet  net.IPNet  `json:"subnet"`
	Address netip.Addr `json:"address"`
}

type ContainerInfo struct {
	Name    string     `json:"name"`
	Device  DeviceInfo `json:"device"`
	Address netip.Addr `json:"address"`
}

type Config struct {
	Endpoint         string `json:"coordination_endpoint"`
	HallucinetSocket string `json:"hallucinet_socket"`
}
