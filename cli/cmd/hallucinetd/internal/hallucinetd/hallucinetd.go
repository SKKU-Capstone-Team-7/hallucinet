package hallucinetd

import (
	"encoding/binary"
	"log"
	"net"
	"os"

	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/internal/comms"
	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/types"
)

type HallucinetDaemon struct {
	listener *net.UnixListener
	config   types.Config
}

func New(config types.Config) (*HallucinetDaemon, error) {
	// Remove existing socket
	socketPath := config.HallucinetSocket
	fileInfo, _ := os.Stat(socketPath)
	if fileInfo != nil {
		err := os.Remove(socketPath)
		if err != nil {
			return nil, err
		}
	}

	listener, err := net.ListenUnix("unix", &net.UnixAddr{
		Name: socketPath,
		Net:  "unix",
	})
	if err != nil {
		return nil, err
	}

	daemon := HallucinetDaemon{
		listener: listener,
		config:   config,
	}

	return &daemon, nil
}

func (daemon HallucinetDaemon) Close() error {
	err := daemon.listener.Close()
	if err != nil {
		return err
	}

	return nil
}

func (daemon HallucinetDaemon) socketListenLoop() error {
	log.Printf("Listening on %v\n", daemon.config.HallucinetSocket)
	for {
		conn, err := daemon.listener.AcceptUnix()
		if err != nil {
			return err
		}
		defer conn.Close()

		headerBuf := make([]byte, binary.Size(comms.MsgHeader{}))
		_, err = conn.Read(headerBuf)
		if err != nil {
			return err
		}

		log.Printf("Received header %v\n", headerBuf)
	}

	return nil
}

func (daemon HallucinetDaemon) Start() error {
	daemon.socketListenLoop()
	return nil
}
