package types

import (
	"net"
	"net/netip"
	"time"
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

type DeviceToken struct {
	DeviceId   string
	Expiration time.Time
}

type Config struct {
	Endpoint         string
	HallucinetSocket string
	Token            string
	DeviceToken      DeviceToken
	DnsAddress       netip.AddrPort
}
