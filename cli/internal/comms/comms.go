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
	Kind          EventKind
	ContainerName string
	ContainerIP   string
}

var coordinationEndpoint = "http://localhost/api/coordination"

func CreateContainer(types.ContainerInfo) error {
	return nil
}
