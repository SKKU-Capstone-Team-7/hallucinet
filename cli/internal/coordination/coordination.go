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

type ContainerInfoDto struct {
	Name    string        `json:"name"`
	Address string        `json:"address"`
	Device  DeviceInfoDto `json:"device"`
}

type Coord struct {
	endpoint string
	JWT      string
}

func New(config types.Config) (*Coord, error) {
	return &Coord{
		endpoint: config.Endpoint,
		JWT:      config.DeviceToken.JWT,
	}, nil
}

func ParseDeviceInfoDto(dev DeviceInfoDto) (types.DeviceInfo, error) {
	return utils.CreateDeviceInfo(dev.Name, dev.Subnet, dev.Address)
}

func ParseContainerInfoDto(container ContainerInfoDto) (types.ContainerInfo, error) {
	device, err := ParseDeviceInfoDto(container.Device)
	if err != nil {
		return types.ContainerInfo{}, err
	}
	return utils.CreateContainerInfo(container.Name, container.Address, device)
}

func (coord *Coord) GetDevices() ([]types.DeviceInfo, error) {
	client := http.Client{}
	deviceURL := fmt.Sprintf("%s/devices", coord.endpoint)
	req, err := http.NewRequest("GET", deviceURL, nil)
	if err != nil {
		return []types.DeviceInfo{}, err
	}
	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", coord.JWT))
	res, err := client.Do(req)
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
		dev, err := ParseDeviceInfoDto(dto)
		if err != nil {
			return []types.DeviceInfo{}, err
		}
		devices = append(devices, dev)
	}

	return devices, nil
}

func (coord *Coord) GetContainers() ([]types.ContainerInfo, error) {
	client := http.Client{}
	containerUrl := fmt.Sprintf("%s/containers", coord.endpoint)
	req, err := http.NewRequest("GET", containerUrl, nil)
	if err != nil {
		return []types.ContainerInfo{}, err
	}
	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", coord.JWT))
	res, err := client.Do(req)
	if err != nil {
		return []types.ContainerInfo{}, err
	}

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return []types.ContainerInfo{}, err
	}

	var containerDtos []ContainerInfoDto
	err = json.Unmarshal(body, &containerDtos)
	if err != nil {
		return []types.ContainerInfo{}, err
	}

	var containers []types.ContainerInfo
	for _, dto := range containerDtos {
		cont, err := ParseContainerInfoDto(dto)
		if err != nil {
			return []types.ContainerInfo{}, err
		}
		containers = append(containers, cont)

	}

	return containers, nil
}
