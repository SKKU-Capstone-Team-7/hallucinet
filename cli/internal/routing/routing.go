package routing

import (
	"errors"
	"net"

	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/types"
	"github.com/vishvananda/netlink"
)

type RouteManager struct{}

var (
	ErrRouteAlreadyExists = errors.New("route already exists")
	ErrRouteDoesNotExist  = errors.New("route does not exist")
	ErrInvalidDeviceIP    = errors.New("invalid subnet")
	ErrInvalidAddress     = errors.New("invalid address")
)

func New(config types.Config) (*RouteManager, error) {
	roma := RouteManager{}
	return &roma, nil
}

func (roma *RouteManager) getRouteToDeviceSubnet(device types.DeviceInfo) (*netlink.Route, error) {
	routes, err := netlink.RouteList(nil, netlink.FAMILY_ALL)
	if err != nil {
		return nil, err
	}

	for _, route := range routes {
		if route.Dst.String() == device.Subnet.String() {
			return &route, nil
		}
	}

	return nil, nil
}

func (roma *RouteManager) AddRouteToDeviceSubnet(device types.DeviceInfo) error {
	existingRoute, err := roma.getRouteToDeviceSubnet(device)
	if err != nil {
		return err
	}

	if existingRoute != nil {
		return ErrRouteAlreadyExists
	}

	dst := net.ParseIP(device.Address.String())
	if dst == nil {
		return ErrInvalidDeviceIP
	}

	route := netlink.Route{
		Dst: &device.Subnet,
		Gw:  dst,
	}

	return netlink.RouteAdd(&route)
}

func (roma *RouteManager) RemoveRouteToDeviceSubnet(device types.DeviceInfo) error {
	route, err := roma.getRouteToDeviceSubnet(device)
	if err != nil {
		return err
	}

	if route == nil {
		return ErrRouteDoesNotExist
	}

	return netlink.RouteDel(route)
}
