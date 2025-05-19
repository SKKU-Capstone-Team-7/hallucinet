package utils

import (
	"encoding/json"
	"errors"
	"net"
	"net/netip"
	"os"

	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/types"
)

type ConfigJson struct {
	Endpoint         string `json:"coordination_endpoint"`
	HallucinetSocket string `json:"hallucinet_socket"`
	DnsAddress       string `json:"dns_address"`
}

var (
	ErrCfgInvalidDnsAddress = errors.New("invalid dns_address")
	ErrInvalidTokenPath     = errors.New("invalid token path")
)

func ReadConfigFile(path string) (types.Config, error) {
	configContent, err := os.ReadFile(path)
	if err != nil {
		return types.Config{}, err
	}

	var configJson ConfigJson
	err = json.Unmarshal(configContent, &configJson)
	if err != nil {
		return types.Config{}, err
	}

	config := types.Config{
		Endpoint:         configJson.Endpoint,
		HallucinetSocket: configJson.HallucinetSocket,
	}

	// DNS listen address must be valid
	dnsAddress, err := netip.ParseAddrPort(configJson.DnsAddress)
	if err != nil {
		return types.Config{}, ErrCfgInvalidDnsAddress
	}
	config.DnsAddress = dnsAddress

	return config, nil
}

func CreateDeviceInfo(name string, subnetStr string, addressStr string) (types.DeviceInfo, error) {
	_, subnet, err := net.ParseCIDR(subnetStr)
	if err != nil {
		return types.DeviceInfo{}, err
	}

	address, err := netip.ParseAddr(addressStr)
	if err != nil {
		return types.DeviceInfo{}, err
	}

	return types.DeviceInfo{
		Name:    name,
		Subnet:  *subnet,
		Address: address,
	}, nil
}

func CreateContainerInfo(name string, addressStr string, device types.DeviceInfo) (types.ContainerInfo, error) {
	address, err := netip.ParseAddr(addressStr)
	if err != nil {
		return types.ContainerInfo{}, nil
	}

	return types.ContainerInfo{
		Name:    name,
		Device:  device,
		Address: address,
	}, nil
}
