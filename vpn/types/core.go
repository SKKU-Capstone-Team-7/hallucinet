package types

import (
	"net"
	"net/netip"
)

type Config struct {
	LinkSubnet   net.IPNet
	LinkName     string
	WgListenPort int
	ListenAddr   netip.AddrPort
}
