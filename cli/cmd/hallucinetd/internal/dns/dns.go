package dns

import (
	"errors"
	"fmt"
	"net/netip"

	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/types"
)

type Dns struct {
	entries map[string]netip.Addr
}

var (
	ErrEntryAlreadyExists = errors.New("entry already exists")
	ErrEntryDoesNotExist  = errors.New("entry does not exist")
)

func New() *Dns {
	dns := Dns{}
	return &dns
}

func (dns Dns) getContainerFQDN(container types.ContainerInfo) string {
	deviceName := container.Device.Name
	containerName := container.Name
	return fmt.Sprintf("%v.%v.test", deviceName, containerName)
}

func (dns Dns) entryExists(container types.ContainerInfo) bool {
	fqdn := dns.getContainerFQDN(container)
	_, ok := dns.entries[fqdn]
	return !ok
}

func (dns Dns) AddEntry(container types.ContainerInfo) error {
	if dns.entryExists(container) {
		return ErrEntryAlreadyExists
	}

	fqdn := dns.getContainerFQDN(container)

	dns.entries[fqdn] = container.Address

	return nil
}

func (dns Dns) RemoveEntry(container types.ContainerInfo) error {
	if !dns.entryExists(container) {
		return ErrEntryDoesNotExist
	}

	fqdn := dns.getContainerFQDN(container)
	delete(dns.entries, fqdn)

	return nil
}
