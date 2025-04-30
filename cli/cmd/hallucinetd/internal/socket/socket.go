package socket

import (
	"errors"
	"log"
	"net"
	"os"
)

type Socket struct {
	listener *net.UnixListener
}

func New(socketPath string) (*Socket, error) {
	// Remove existing socket
	_, err := os.Stat(socketPath)
	if errors.Is(err, os.ErrExist) {
		err = os.Remove(socketPath)
		if err != nil {
			log.Printf("Cannot remove socket %v. %v\n", socketPath, err)
			return nil, err
		}
	}

	listener, err := net.ListenUnix("unix", &net.UnixAddr{
		Name: socketPath,
		Net:  "unix",
	})
	if err != nil {
		log.Printf("Cannot listen to socket %v. %v\n", socketPath, err)
		return nil, err
	}

	socket := Socket{
		listener: listener,
	}

	log.Printf("Socket created: %v\n", *socket.listener)
	return &socket, nil
}
