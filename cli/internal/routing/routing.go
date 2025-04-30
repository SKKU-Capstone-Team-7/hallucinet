package routing

import (
	"container/list"
	"errors"
	"log"
	"net"
	"reflect"

	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/types"
	"github.com/vishvananda/netlink"
)

type RouteManager struct {
	routes list.List // []netlink.Route
}

// Errors
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
	if roma.routeExists(subnet) {
		err := ErrRouteAlreadyExists
		log.Printf("Cannot add route for subnet %v. %v\n", subnet, err)
		return err
	}

	routerIP := net.ParseIP(routerDevice.Address.String())
	if routerIP == nil {
		err := ErrInvalidAddress
		log.Printf("Cannot parse router device IP %v. %v\n", routerIP, ErrInvalidAddress)
		return err
	}

	route := netlink.Route{
		Dst: &subnet,
		Gw:  routerIP,
	}
	err := netlink.RouteAdd(&route)
	if err != nil {
		log.Printf("Cannot add route %v. %v\n", route, err)
		return err
	}

	return nil
}

func (roma RouteManager) RemoveRoute(subnet net.IPNet) error {
	if !roma.routeExists(subnet) {
		err := ErrRouteDoesNotExist
		log.Printf("Cannot remove route to %v. %v\n", subnet, err)
		return err
	}

	route := roma.getRouteBySubnet(subnet)
	if route == nil {
		err := ErrRouteDoesNotExist
		log.Printf("Cannot get route for subnet %v. %v\n", subnet, err)
		return err
	}

	err := netlink.RouteDel(route)
	if err != nil {
		log.Printf("Cannot add route %v\n", err)
		return err
	}

	return nil
}
