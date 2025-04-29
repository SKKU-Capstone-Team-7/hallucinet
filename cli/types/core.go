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

type Config struct {
	Endpoint string `json:"coordination_endpoint"`
}
