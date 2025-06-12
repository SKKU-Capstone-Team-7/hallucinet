package routing

import (
	"net"
	"net/netip"

	"github.com/vishvananda/netlink"
)

func RemoveRouteToSubnet(subnet netip.Prefix) error {
	routes, err := netlink.RouteList(nil, netlink.FAMILY_ALL)
	if err != nil {
		return err
	}

	for _, route := range routes {
		if route.Dst.String() == subnet.String() {
			netlink.RouteDel(&route)
			return nil
		}
	}

	return nil
}

func AddRouteToDeviceSubnet(subnet netip.Prefix, via netip.Addr) error {
	err := RemoveRouteToSubnet(subnet)
	if err != nil {
		return err
	}

	_, dst, err := net.ParseCIDR(subnet.String())
	if err != nil {
		return err
	}

	gw := net.ParseIP(via.String())

	route := netlink.Route{
		Dst: dst,
		Gw:  gw,
	}

	return netlink.RouteAdd(&route)
}
