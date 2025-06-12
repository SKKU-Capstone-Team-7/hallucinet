package vpn

import (
	"log"
	"net"
	"net/netip"

	"github.com/vishvananda/netlink"
	"golang.zx2c4.com/wireguard/wgctrl"
	"golang.zx2c4.com/wireguard/wgctrl/wgtypes"
)

var (
	Client     *wgctrl.Client
	LinkName   = "hallucinet0"
	ServerPort = 55123
)

func SetupWireguardLink(vpnEndpoint netip.AddrPort, privKey wgtypes.Key, vpnAddr netip.Addr, serverKey wgtypes.Key) {
	RemoveWireguardLink()

	linkAttrs := netlink.NewLinkAttrs()
	linkAttrs.Name = LinkName

	// Create link
	link := netlink.Wireguard{LinkAttrs: linkAttrs}
	err := netlink.LinkAdd(&link)
	if err != nil {
		log.Panicf("Cannot add wireguard link. %v\n", err)
	}
	netlinkAddr, err := netlink.ParseAddr(vpnAddr.String() + "/16")
	if err != nil {
		log.Panicf("Cannot parse link address %v. %v\n", vpnAddr, err)
	}
	err = netlink.AddrAdd(&link, netlinkAddr)
	if err != nil {
		log.Panicf("Cannot add address %v to link %v. %v\n", vpnAddr, link.Name, err)
	}

	// Setup wg
	c, err := wgctrl.New()
	if err != nil {
		log.Panicf("Cannot create wireguard client. %v\n", err)
	}

	endpointIP := net.ParseIP(vpnEndpoint.Addr().String())
	_, cidr, _ := net.ParseCIDR(vpnAddr.String() + "/16")
	serverPeer := wgtypes.PeerConfig{
		PublicKey: serverKey,
		Endpoint: &net.UDPAddr{
			IP:   endpointIP,
			Port: int(vpnEndpoint.Port()),
		},
		AllowedIPs: []net.IPNet{*cidr},
	}
	c.ConfigureDevice(LinkName, wgtypes.Config{
		PrivateKey:   &privKey,
		ReplacePeers: true,
		Peers:        []wgtypes.PeerConfig{serverPeer},
	})
}

func RemoveWireguardLink() {
	links, err := netlink.LinkList()
	if err != nil {
		log.Panicf("Cannot get list of links. %v\n", err)
	}

	for _, link := range links {
		attrs := link.Attrs()
		if attrs.Name == LinkName {
			err := netlink.LinkDel(link)
			if err != nil {
				log.Panicf("Cannot remove link %v. %v\n\n", attrs.Name, err)
			}
		}
	}
}
