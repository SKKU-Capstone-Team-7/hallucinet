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
	Image   string
	Address netip.Addr
}

type DeviceToken struct {
	DeviceId   string
	Expiration time.Time
	JWT        string
}

type Config struct {
	Endpoint         string
	HallucinetSocket string
	DeviceToken      DeviceToken
	DnsAddress       netip.AddrPort
}

type WsMsg struct {
	Event string `json:"event"`
	Data  string `json:"data"`
}
