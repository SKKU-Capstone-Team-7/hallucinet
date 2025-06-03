package comms

import (
	"errors"

	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/internal/coordination"
)

type MsgKind int32

const (
	MsgStartDaemon = iota
	MsgStopDaemon
)

type MsgHeader struct {
	Kind MsgKind
	Size int32
}
type Msg struct {
	Header MsgHeader
	Data   any
}

var ErrUnknownEvent = errors.New("unknown event")

type EventKind int32

const (
	EventContainerConnected = iota
	EventContainerDisconnected
	EventUnknown
)

type WsMsg struct {
	Event string `json:"event"`
	Data  any    `json:"data"`
}
type WsContEventPayload struct {
	Token string    `json:"token"`
	Event ContEvent `json:"event"`
}

type ContEvent struct {
	ConvEventKind  EventKind `json:"kind"`
	ContainerName  string    `json:"container_name"`
	ContainerIP    string    `json:"container_ip"`
	ContainerImage string    `json:"container_image"`
}

type WsDevConnectPayload struct {
	Token      string      `json:"token"`
	Containers []ContEvent `json:"containers"`
}

type WsDevDisconnectPayload struct {
	DeviceId string `json:"deviceId"`
}

type WsTeamContainersPayload struct {
	Containers []coordination.ContainerInfoDto `json:"containers"`
}
