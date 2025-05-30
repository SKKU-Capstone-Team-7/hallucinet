package dns

import (
	"errors"
	"fmt"
	"net/netip"

	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/types"
	dnslib "github.com/miekg/dns"
)

type Dns struct {
	entries map[string]netip.Addr
	address netip.AddrPort
	server  dnslib.Server
}

var (
	ErrEntryAlreadyExists = errors.New("entry already exists")
	ErrEntryDoesNotExist  = errors.New("entry does not exist")
)

func New(config types.Config) (*Dns, error) {
	dns := Dns{
		address: config.DnsAddress,
		entries: make(map[string]netip.Addr),
	}

	dns.server = dnslib.Server{
		Addr: config.DnsAddress.String(),
		Net:  "udp",
	}

	return &dns, nil
}

func (dns *Dns) getContainerFQDN(container types.ContainerInfo) string {
	deviceName := container.Device.Name
	containerName := container.Name
	return fmt.Sprintf("%v.%v.test.", deviceName, containerName)
}

func (dns *Dns) entryExists(container types.ContainerInfo) bool {
	fqdn := dns.getContainerFQDN(container)
	_, ok := dns.entries[fqdn]
	return ok
}

func (dns *Dns) AddEntry(container types.ContainerInfo) error {
	if dns.entryExists(container) {
		return ErrEntryAlreadyExists
	}

	fqdn := dns.getContainerFQDN(container)

	dns.entries[fqdn] = container.Address

	return nil
}

func (dns *Dns) RemoveEntry(container types.ContainerInfo) error {
	if !dns.entryExists(container) {
		return ErrEntryDoesNotExist
	}

	fqdn := dns.getContainerFQDN(container)
	delete(dns.entries, fqdn)

	return nil
}

func (dns *Dns) ClearEntries() {
	clear(dns.entries)
}

func (dns *Dns) handleDNSRequest(rw dnslib.ResponseWriter, req *dnslib.Msg) {
	res := new(dnslib.Msg)
	res.SetReply(req)

	if len(req.Question) > 1 {
		res.Rcode = dnslib.RcodeFormatError
		rw.WriteMsg(res)
		return
	}

	q := req.Question[0]
	switch q.Qtype {
	case dnslib.TypeA:
		entry, exists := dns.entries[q.Name]
		if !exists {
			// Fallback to 1.1.1.1
			c := dnslib.Client{}
			fallbackRes, _, err := c.Exchange(req, "1.1.1.1:53")
			if err != nil {
				res.Rcode = dnslib.RcodeNameError
				rw.WriteMsg(res)
				return
			}
			rw.WriteMsg(fallbackRes)
			return
		}

		ttl := 3600
		rrStr := fmt.Sprintf("%v %v IN A %v", q.Name, ttl, entry.String())
		rr, _ := dnslib.NewRR(rrStr)
		res.Answer = append(res.Answer, rr)
		rw.WriteMsg(res)
	}
}

func (dns *Dns) Start() error {
	mux := dnslib.NewServeMux()
	mux.HandleFunc(".", dns.handleDNSRequest)
	dns.server.Handler = mux

	return dns.server.ListenAndServe()
}

func (dns *Dns) Stop() error {
	dns.ClearEntries()
	return dns.server.Shutdown()
}
