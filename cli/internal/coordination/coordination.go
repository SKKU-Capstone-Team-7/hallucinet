package coordination

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"net/netip"

	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/internal/utils"
	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/types"
)

type DeviceInfoDto struct {
	Name    string `json:"name"`
	Subnet  string `json:"subnet"`
	Address string `json:"address"`
}

type Coord struct {
	config        types.Config
	coordEndpoint string
	token         string
}

func New(configPath string, tokenPath string) (*Coord, error) {
	coordConfig, err := utils.ReadConfigFile(configPath)
	if err != nil {
		return nil, err
	}

	token, err := utils.ReadTokenFile(tokenPath)
	if err != nil {
		return nil, err
	}

	return &Coord{
		config:        coordConfig,
		coordEndpoint: coordConfig.Endpoint,
		token:         token,
	}, nil
}

func parseDeviceInfoDto(dev DeviceInfoDto) (types.DeviceInfo, error) {
	_, subnet, err := net.ParseCIDR(dev.Subnet)
	if err != nil {
		println("Cannot subnet CIDR %v. %v\n", dev.Subnet, err)
		return types.DeviceInfo{}, err
	}

	address, err := netip.ParseAddr(dev.Address)
	if err != nil {
		println("Cannot parse address %v. %v\n", dev.Address, err)
		return types.DeviceInfo{}, err
	}

	return types.DeviceInfo{
		Name:    dev.Name,
		Subnet:  *subnet,
		Address: address,
	}, nil
}

func (coord Coord) GetDevices() ([]types.DeviceInfo, error) {
	deviceURL := fmt.Sprintf("%s/devices", coord.config.Endpoint)
	res, err := http.Get(deviceURL)
	if err != nil {
		log.Printf("Cannot GET %v\n. %v\n", deviceURL, err)
		return []types.DeviceInfo{}, err
	}

	body, err := io.ReadAll(res.Body)
	if err != nil {
		log.Printf("Cannot read GET /devices response body %v. %v\n", deviceURL, err)
		return []types.DeviceInfo{}, err
	}

	var deviceDtos []DeviceInfoDto
	err = json.Unmarshal(body, &deviceDtos)
	if err != nil {
		log.Printf("Cannot unmarshal GET /devices. %v\n", err)
		return []types.DeviceInfo{}, err
	}

	var devices []types.DeviceInfo
	for _, dto := range deviceDtos {
		dev, err := parseDeviceInfoDto(dto)
		if err != nil {
			println("Cannot convert DTO to DeviceInfo. %v\n", err)
			return []types.DeviceInfo{}, err
		}
		devices = append(devices, dev)
	}

	return devices, nil
}
