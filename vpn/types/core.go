package types

import (
	"net/netip"
)

type Config struct {
	LinkAddr     netip.Prefix
	LinkName     string
	WgListenPort int
	ListenAddr   netip.AddrPort
}
