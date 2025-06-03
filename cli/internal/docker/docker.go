package docker

import (
	"context"
	"log"

	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/internal/comms"
	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/types"
	dockerTypes "github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/events"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/client"
)

type DockerMonitor struct {
	client      *client.Client
	EventChan   chan comms.ContEvent
	networkName string
}

func New(config types.Config) (*DockerMonitor, error) {
	cli, err := client.NewClientWithOpts()
	if err != nil {
		return nil, err
	}
	domon := DockerMonitor{}
	domon.client = cli
	domon.EventChan = domon.createEventsChannel()
	domon.networkName = config.NetworkName

	return &domon, nil
}

func (domon *DockerMonitor) createDockerChannel() (<-chan events.Message, <-chan error) {
	filters := filters.NewArgs(
		filters.Arg("type", "network"),
		filters.Arg("event", "connect"),
		filters.Arg("event", "disconnect"),
	)

	dockerChan, chanErr := domon.client.Events(context.Background(),
		events.ListOptions{Filters: filters})
	return dockerChan, chanErr
}

func (domon *DockerMonitor) createEventsChannel() chan comms.ContEvent {
	dockerChan, dockerErrChan := domon.createDockerChannel()
	eventChan := make(chan comms.ContEvent)
	domon.publishExistingContainers()

	go func() {
		for {
			select {
			case dockerEvent := <-dockerChan:
				event := domon.translateDockerEvent(dockerEvent)
				eventChan <- event
			case dockerErr := <-dockerErrChan:
				log.Panicf("Docker error event: %v\n", dockerErr)
			}
		}
	}()

	return eventChan
}

func (domon *DockerMonitor) publishExistingContainers() {
	log.Printf("Pubishing existing containers...")
}

func (domon *DockerMonitor) getContainerName(containerID string) string {
	cli := domon.client
	conJson, err := cli.ContainerInspect(context.Background(), containerID)
	if err != nil {
		log.Panicf("Cannot inspect container %v: %v\n", containerID, err)
	}

	return conJson.Name
}

func (domon *DockerMonitor) getContainerImage(containerID string) string {
	cli := domon.client
	conJson, err := cli.ContainerInspect(context.Background(), containerID)
	if err != nil {
		log.Panicf("Cannot inspect container %v: %v\n", containerID, err)
	}

	img, _, err := cli.ImageInspectWithRaw(context.Background(), conJson.Image)
	if err != nil {
		log.Panicf("Cannot inspect image %v\n", conJson.Image)
	}

	return img.RepoTags[0]
}

func (domon *DockerMonitor) getContainerIP(containerID string, networkName string) string {
	cli := domon.client
	conJson, err := cli.ContainerInspect(context.Background(), containerID)
	if err != nil {
		log.Panicf("Cannot inspect container %v: %v\n", containerID, err)
	}
	return conJson.NetworkSettings.Networks[networkName].IPAddress
}

func (domon *DockerMonitor) translateDockerEvent(e events.Message) comms.ContEvent {
	networkName := e.Actor.Attributes["name"]
	containerID := e.Actor.Attributes["container"]
	containerName := domon.getContainerName(containerID)[1:]
	containerIP := domon.getContainerIP(containerID, networkName)
	containerImage := domon.getContainerImage(containerID)

	var kind comms.EventKind
	switch e.Action {
	case events.ActionConnect:
		kind = comms.EventContainerConnected
	case events.ActionDisconnect:
		kind = comms.EventContainerDisconnected
	default:
		kind = comms.EventUnknown
	}

	return comms.ContEvent{
		ConvEventKind:  kind,
		ContainerName:  containerName,
		ContainerIP:    containerIP,
		ContainerImage: containerImage,
	}
}

func (domon *DockerMonitor) containerDoContEvent(cont dockerTypes.Container) comms.ContEvent {
	contEvent := comms.ContEvent{
		ConvEventKind:  comms.EventContainerConnected,
		ContainerName:  domon.getContainerName(cont.ID)[1:],
		ContainerIP:    domon.getContainerIP(cont.ID, domon.networkName),
		ContainerImage: domon.getContainerImage(cont.ID),
	}

	return contEvent
}

// All events are EventContainerConnected
func (domon *DockerMonitor) GetDeviceContainers() ([]comms.ContEvent, error) {
	containers := []comms.ContEvent{}
	client := domon.client
	conts, err := client.ContainerList(context.Background(), container.ListOptions{})
	if err != nil {
		return []comms.ContEvent{}, err
	}

	for _, cont := range conts {
		contEvent := domon.containerDoContEvent(cont)
		containers = append(containers, contEvent)
	}

	return containers, nil
}

func (domon *DockerMonitor) Close() error {
	return domon.client.Close()
}
