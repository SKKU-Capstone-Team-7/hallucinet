package routing

import (
	"container/list"
	"errors"
	"net"
	"reflect"

	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/types"
	"github.com/vishvananda/netlink"
)

type RouteManager struct {
	routes list.List // []netlink.Route
}

var (
	ErrRouteAlreadyExists = errors.New("route already exists")
	ErrRouteDoesNotExist  = errors.New("route does not exist")
	ErrInvalidAddress     = errors.New("invalid address")
)

func (roma RouteManager) subnetEquals(subnetA net.IPNet, subnetB net.IPNet) bool {
	ipA := subnetA.IP
	maskA := subnetA.Mask
	ipB := subnetB.IP
	maskB := subnetB.Mask

	return ipA.Equal(ipB) && reflect.DeepEqual(maskA, maskB)
}

func (roma RouteManager) routeExists(subnet net.IPNet) bool {
	for routeItem := roma.routes.Front(); routeItem != nil; routeItem = routeItem.Next() {
		route := routeItem.Value.(netlink.Route)

		if roma.subnetEquals(subnet, *route.Dst) {
			return true
		}
	}

	return false
}

func (roma RouteManager) getRouteBySubnet(subnet net.IPNet) *netlink.Route {
	for routeItem := roma.routes.Front(); routeItem != nil; routeItem = routeItem.Next() {
		route := routeItem.Value.(netlink.Route)

		if roma.subnetEquals(subnet, *route.Dst) {
			return &route
		}
	}

	return nil
}

func (roma RouteManager) AddRoute(subnet net.IPNet, routerDevice types.DeviceInfo) error {
	routerIP := net.ParseIP(routerDevice.Address.String())
	if routerIP == nil {
		return ErrInvalidAddress
	}

	route := netlink.Route{
		Dst: &subnet,
		Gw:  routerIP,
	}
	return netlink.RouteAdd(&route)
}

func (roma RouteManager) RemoveRoute(subnet net.IPNet) error {
	route := roma.getRouteBySubnet(subnet)
	if route == nil {
		return ErrRouteDoesNotExist
	}

	return netlink.RouteDel(route)
}
