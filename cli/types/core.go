package types

import "net"

type DeviceInfo struct {
	name    string    `json:"name"`
	subnet  net.IPNet `json:"subnet"`
	address net.Addr  `json:"address"`
}
