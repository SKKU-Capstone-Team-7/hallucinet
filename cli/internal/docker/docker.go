package docker

import (
	"context"
	"log"

	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/internal/comms"
	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/types"
	"github.com/docker/docker/api/types/events"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/client"
)

type DockerMonitor struct {
	client    *client.Client
	EventChan chan comms.Event
}

func New(config types.Config) (*DockerMonitor, error) {
	cli, err := client.NewClientWithOpts()
	if err != nil {
		return nil, err
	}
	domon := DockerMonitor{}
	domon.client = cli
	domon.EventChan = domon.createEventsChannel()

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

func (domon *DockerMonitor) createEventsChannel() chan comms.Event {
	dockerChan, dockerErrChan := domon.createDockerChannel()
	eventChan := make(chan comms.Event)
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

func (domon *DockerMonitor) getContainerIP(containerID string, networkName string) string {
	cli := domon.client
	conJson, err := cli.ContainerInspect(context.Background(), containerID)
	if err != nil {
		log.Panicf("Cannot inspect container %v: %v\n", containerID, err)
	}
	return conJson.NetworkSettings.Networks[networkName].IPAddress
}

func (domon *DockerMonitor) translateDockerEvent(e events.Message) comms.Event {
	networkName := e.Actor.Attributes["name"]
	containerID := e.Actor.Attributes["container"]
	containerName := domon.getContainerName(containerID)[1:]
	containerIP := domon.getContainerIP(containerID, networkName)

	var kind comms.EventKind
	switch e.Action {
	case events.ActionConnect:
		kind = comms.EventContainerConnected
	case events.ActionDisconnect:
		kind = comms.EventContainerDisconnected
	default:
		kind = comms.EventUnknown
	}

	return comms.Event{
		Kind:          kind,
		ContainerName: containerName,
		ContainerIP:   containerIP,
	}
}

func (domon *DockerMonitor) Close() error {
	return domon.client.Close()
}
