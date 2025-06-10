package hallucinet

import (
	"encoding/binary"
	"fmt"
	"net"
	"time"

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
	deadline := time.Now().Add(5 * time.Second)

	for {
		conn, err := net.DialUnix("unix", nil, &net.UnixAddr{
			Name: socketPath,
			Net:  "unix",
		})
		if err == nil {
			defer conn.Close()
			err = binary.Write(conn, binary.NativeEndian, msg.Header)
			// TODO: send body
			return err
		}

		// Check if time limit exceeded
		if time.Now().After(deadline) {
			return fmt.Errorf("failed to send message after 5s: %w", err)
		}

		time.Sleep(200 * time.Millisecond) // small delay before retry
	}
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
