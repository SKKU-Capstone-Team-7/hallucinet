package wireguard

import (
	"fmt"
	"log"
	"net"
	"net/netip"

	"github.com/SKKU-Capstone-Team-7/hallucinet/vpn/types"
	"github.com/vishvananda/netlink"
	"golang.zx2c4.com/wireguard/wgctrl"
	"golang.zx2c4.com/wireguard/wgctrl/wgtypes"
)

type Wireguard struct {
	LinkAddr   netip.Prefix
	LinkName   string
	ListenPort int
	Link       *netlink.Wireguard
	Client     *wgctrl.Client
	Device     *wgtypes.Device
}

func New(config types.Config) Wireguard {
	client, err := wgctrl.New()
	if err != nil {
		log.Panicf("Cannot create wireguard client. %v\n", err)
	}

	return Wireguard{
		LinkAddr:   config.LinkAddr,
		LinkName:   config.LinkName,
		ListenPort: config.WgListenPort,
		Client:     client,
	}
}

func (wg *Wireguard) RemoveWireguardLink() {
	links, err := netlink.LinkList()
	if err != nil {
		log.Panicf("Cannot get list of links. %v\n", err)
	}

	for _, link := range links {
		attrs := link.Attrs()
		if attrs.Name == wg.LinkName {
			err := netlink.LinkDel(link)
			if err != nil {
				log.Panicf("Cannot remove link %v. %v\n\n", attrs.Name, err)
			}
		}
	}
}

func (wg *Wireguard) CreateWireguardLink() {
	wg.RemoveWireguardLink()

	linkAttrs := netlink.NewLinkAttrs()
	linkAttrs.Name = wg.LinkName

	// Create link
	link := netlink.Wireguard{LinkAttrs: linkAttrs}
	err := netlink.LinkAdd(&link)
	if err != nil {
		log.Panicf("Cannot add wireguard link. %v\n", err)
	}
	addr, err := netlink.ParseAddr(wg.LinkAddr.String())
	if err != nil {
		log.Panicf("Cannot parse link address %v. %v\n", addr, err)
	}
	err = netlink.AddrAdd(&link, addr)
	if err != nil {
		log.Panicf("Cannot add address %v to link %v. %v\n", addr, link.Name, err)
	}

	// Configure wireguard device
	key, err := wgtypes.GeneratePrivateKey()
	if err != nil {
		log.Panicf("Cannot generate wireguard private key. %v\n", err)
	}

	wg.Client.ConfigureDevice(link.Name, wgtypes.Config{
		PrivateKey: &key,
		ListenPort: &wg.ListenPort,
	})

	dev, err := wg.Client.Device(wg.LinkName)
	if err != nil {
		log.Panicf("Cannot get wireguard device %v. %v\n", wg.LinkName, err)
	}

	wg.Link = &link
	wg.Device = dev
}

func (wg *Wireguard) SetLinkUp() {
	err := netlink.LinkSetUp(wg.Link)
	if err != nil {
		log.Panicf("Cannot set link up. %v\n", err)
	}
}

func (wg *Wireguard) RemovePeer(pubkey wgtypes.Key) error {
	peer := wgtypes.PeerConfig{
		PublicKey: pubkey,
		Remove:    true,
	}

	err := wg.Client.ConfigureDevice(wg.LinkName, wgtypes.Config{
		Peers: []wgtypes.PeerConfig{peer},
	})
	if err != nil {
		return err
	}

	return nil
}

func (wg *Wireguard) AddPeer(pubkey wgtypes.Key, ip netip.Addr, subnet net.IPNet) error {
	allowedIp, err := netlink.ParseIPNet(fmt.Sprintf("%v/32", ip))
	if err != nil {
		return err
	}

	peer := wgtypes.PeerConfig{
		PublicKey:         pubkey,
		AllowedIPs:        []net.IPNet{*allowedIp, subnet},
		ReplaceAllowedIPs: true,
	}

	err = wg.Client.ConfigureDevice(wg.LinkName, wgtypes.Config{
		Peers: []wgtypes.PeerConfig{peer},
	})
	if err != nil {
		return err
	}

	return nil
}

// // Set link up
// err = netlink.LinkSetUp(hl0)
// if err != nil {
// 	log.Fatalf("Cannot set link hl0 up. %v\n", err)
// }
// log.Printf("Link hl0 is up!")
//
// client, err := wgctrl.New()
// if err != nil {
// 	log.Fatalf("Cannot create wgctrl client. %v\n", err)
// }
// log.Printf("Created wgctrl client %v.\n", client)
//
// devices, err := client.Devices()
// if err != nil {
// 	log.Fatalf("Cannot get devices list. %v\n", err)
// }
// log.Printf("Wireguard devices: \n")
// for i, device := range devices {
// 	log.Printf("%v: %v (%v)\n", i, device.Name, device.Type.String())
// }
//
// // Configure devices
// config := wgtypes.Config{
// 	PrivateKey:   &wgtypes.Key{},
// 	ListenPort:   new(int),
// 	FirewallMark: new(int),
// 	ReplacePeers: false,
// 	Peers:        []wgtypes.PeerConfig{},
// }
// }
