package comms

import (
	"errors"

	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/types"
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

type Event struct {
	Kind           EventKind `json:"kind"`
	ContainerName  string    `json:"container_name"`
	ContainerIP    string    `json:"container_ip"`
	ContainerImage string    `json:"container_image"`
}

type WsMsg struct {
	Event string    `json:"event"`
	Data  WsPayload `json:"data"`
}

type WsPayload struct {
	Token string `json:"token"`
	Event Event  `json:"event"`
}

func CreateContainer(types.ContainerInfo) error {
	return nil
}
