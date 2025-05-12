package comms

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
