package socket

import (
	"log"
	"net"
)

type Socket struct {
	conn net.Conn
}

func New(socketPath string) *Socket {
	conn, err := net.Dial("unix", socketPath)
	if err != nil {
		log.Printf("Cannot dial %v. %v\n", socketPath, err)
	}
	socket := Socket{
		conn: conn,
	}
	return &socket
}
