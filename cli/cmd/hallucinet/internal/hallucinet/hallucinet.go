package hallucinet

import (
	"encoding/binary"
	"net"

	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/internal/comms"
	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/types"
)

type Hallucinet struct {
	config types.Config
}

func New(config types.Config) *Hallucinet {
	hallucinet := &Hallucinet{
		config: config,
	}

	return hallucinet
}

func (hnet Hallucinet) sendMessage(msg comms.Msg) error {
	socketPath := hnet.config.HallucinetSocket
	conn, err := net.DialUnix("unix", nil, &net.UnixAddr{
		Name: socketPath,
		Net:  "unix",
	})
	if err != nil {
		return err
	}
	defer conn.Close()

	err = binary.Write(conn, binary.NativeEndian, msg.Header)
	if err != nil {
		return err
	}

	// TODO send body
	return err
}

func (hnet Hallucinet) Start() error {
	msg := comms.Msg{
		Header: comms.MsgHeader{
			Kind: comms.MsgStartDaemon,
			Size: 0,
		},
		Data: nil,
	}

	err := hnet.sendMessage(msg)

	return err
}

func (hnet Hallucinet) Stop() error {
	msg := comms.Msg{
		Header: comms.MsgHeader{
			Kind: comms.MsgStopDaemon,
			Size: 0,
		},
		Data: nil,
	}

	err := hnet.sendMessage(msg)

	return err
}
