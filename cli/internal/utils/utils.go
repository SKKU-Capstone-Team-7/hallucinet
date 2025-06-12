package utils

import (
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"net/netip"
	"os"

	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/types"
)

type ConfigJson struct {
	Endpoint         string `json:"hallucinet_endpoint"`
	HallucinetSocket string `json:"hallucinet_socket"`
	DnsAddress       string `json:"dns_address"`
	VPNEndpoint      string `json:"vpn_endpoint"`
}

var (
	ErrCfgInvalidVpnEndpoint = errors.New("invalid vpn_endpoint")
	ErrCfgInvalidDnsAddress  = errors.New("invalid dns_address")
	ErrInvalidTokenPath      = errors.New("invalid token path")
)

func resolveAddrPort(hostport string) (netip.AddrPort, error) {
	host, port, err := net.SplitHostPort(hostport)
	if err != nil {
		return netip.AddrPort{}, err
	}

	ips, err := net.LookupIP(host)
	if err != nil || len(ips) == 0 {
		return netip.AddrPort{}, fmt.Errorf("host resolution failed: %v", err)
	}

	ip := ips[0] // Pick first resolved IP
	parsedIP, err := netip.ParseAddr(ip.String())
	if err != nil {
		return netip.AddrPort{}, fmt.Errorf("invalid IP: %v", ip)
	}

	// Parse port
	p, err := net.LookupPort("udp", port) // or "tcp" depending on use case
	if err != nil {
		return netip.AddrPort{}, err
	}

	return netip.AddrPortFrom(parsedIP, uint16(p)), nil
}

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
		// NetworkName:      "bridge",
		NetworkName: "hallucinet",
	}

	// DNS listen address must be valid
	dnsAddress, err := netip.ParseAddrPort(configJson.DnsAddress)
	if err != nil {
		return types.Config{}, ErrCfgInvalidDnsAddress
	}
	config.DnsAddress = dnsAddress

	// Check VPN endpoint
	vpnEndpoint, err := resolveAddrPort(configJson.VPNEndpoint)
	if err != nil {
		return types.Config{}, ErrCfgInvalidVpnEndpoint
	}
	config.VPNEndpoint = vpnEndpoint

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
