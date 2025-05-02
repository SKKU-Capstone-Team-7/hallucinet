package types

import (
	"net"
	"net/netip"
)

type DeviceInfo struct {
	Name    string
	Subnet  net.IPNet
	Address netip.Addr
}

type ContainerInfo struct {
	Name    string
	Device  DeviceInfo
	Address netip.Addr
}

type Config struct {
	Endpoint         string
	HallucinetSocket string
	Token            string
	DnsAddress       netip.AddrPort
}
