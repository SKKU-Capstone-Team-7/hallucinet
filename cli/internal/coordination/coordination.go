package coordination

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/internal/utils"
	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/types"
)

type DeviceInfoDto struct {
	Name    string `json:"name"`
	Subnet  string `json:"subnet"`
	Address string `json:"address"`
}

type Coord struct {
	endpoint string
	token    string
}

func New(config types.Config) (*Coord, error) {
	return &Coord{
		endpoint: config.Endpoint,
		token:    config.Token,
	}, nil
}

func parseDeviceInfoDto(dev DeviceInfoDto) (types.DeviceInfo, error) {
	return utils.CreateDeviceInfo(dev.Name, dev.Subnet, dev.Address)
}

func (coord *Coord) GetDevices() ([]types.DeviceInfo, error) {
	deviceURL := fmt.Sprintf("%s/devices", coord.endpoint)
	res, err := http.Get(deviceURL)
	if err != nil {
		return []types.DeviceInfo{}, err
	}

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return []types.DeviceInfo{}, err
	}

	var deviceDtos []DeviceInfoDto
	err = json.Unmarshal(body, &deviceDtos)
	if err != nil {
		return []types.DeviceInfo{}, err
	}

	var devices []types.DeviceInfo
	for _, dto := range deviceDtos {
		dev, err := parseDeviceInfoDto(dto)
		if err != nil {
			return []types.DeviceInfo{}, err
		}
		devices = append(devices, dev)
	}

	return devices, nil
}
