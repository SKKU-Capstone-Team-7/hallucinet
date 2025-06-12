package vpn

import (
	"encoding/json"
	"errors"
	"io"
	"log"
	"net"
	"net/http"
	"net/netip"
	"slices"

	"github.com/SKKU-Capstone-Team-7/hallucinet/vpn/internal/routing"
	"github.com/SKKU-Capstone-Team-7/hallucinet/vpn/internal/wireguard"
	"github.com/SKKU-Capstone-Team-7/hallucinet/vpn/types"
	"github.com/korylprince/ipnetgen"
	"github.com/vishvananda/netlink"
	"golang.zx2c4.com/wireguard/wgctrl/wgtypes"
)

type VPN struct {
	config         types.Config
	usedIPs        []netip.Addr // Use this because it's comparable
	pubkeyToIP     map[string]netip.Addr
	pubkeyToSubnet map[string]netip.Prefix
	wg             wireguard.Wireguard
}

func New(config types.Config) VPN {
	wg := wireguard.New(config)
	return VPN{
		config:         config,
		wg:             wg,
		pubkeyToIP:     map[string]netip.Addr{},
		pubkeyToSubnet: map[string]netip.Prefix{},
		usedIPs: []netip.Addr{
			config.LinkAddr.Masked().Addr(),
			config.LinkAddr.Addr(),
		},
	}
}

type UnregisterBody struct {
	Pubkey string `json:"pubkey"`
}
type RegisterBody struct {
	Pubkey string `json:"pubkey"`
	Subnet string `json:"subnet"`
}
type Response struct {
	Pubkey  string `json:"pubkey"`
	Address string `json:"address"`
}

func (vpn *VPN) unregisterHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var form UnregisterBody
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	err = json.Unmarshal(body, &form)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	devPubkey, err := wgtypes.ParseKey(form.Pubkey)
	if err != nil {
		http.Error(w, "Invalid pubkey", http.StatusBadRequest)
		return
	}
	err = vpn.RemoveClient(devPubkey)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	log.Printf("Removed peer %v\n", devPubkey.String())

	w.WriteHeader(http.StatusOK)
}

func (vpn *VPN) registerHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var form RegisterBody
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	err = json.Unmarshal(body, &form)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	devSubnet, err := netlink.ParseIPNet(form.Subnet)
	if err != nil {
		http.Error(w, "Invalid subnet", http.StatusBadRequest)
		return
	}
	devPubkey, err := wgtypes.ParseKey(form.Pubkey)
	if err != nil {
		http.Error(w, "Invalid pubkey", http.StatusBadRequest)
		return
	}

	devIP, err := vpn.AddClient(devPubkey, *devSubnet)
	if err != nil {
		log.Printf("%v\n", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	log.Printf("Added peer %v\n", devPubkey.String())

	res, err := json.Marshal(Response{
		Pubkey:  vpn.wg.Device.PublicKey.String(),
		Address: devIP.String(),
	})
	if err != nil {
		log.Panicf("Cannot marshal response. %v\n", err)
	}

	_, err = w.Write(res)
	if err != nil {
		log.Panicf("Cannot write response. %v\n", err)
	}
}

func (vpn *VPN) GetDeviceIP(pubkey wgtypes.Key) (netip.Addr, error) {
	peerIP, ok := vpn.pubkeyToIP[pubkey.String()]
	if ok {
		return peerIP, nil
	}

	gen, err := ipnetgen.New(vpn.config.LinkAddr.String())
	if err != nil {
		return netip.Addr{}, nil
	}
	for ip := gen.Next(); ip != nil; ip = gen.Next() {
		ipAddr, err := netip.ParseAddr(ip.String())
		if err != nil {
			return netip.Addr{}, err
		}

		if !slices.Contains(vpn.usedIPs, ipAddr) {
			vpn.pubkeyToIP[pubkey.String()] = ipAddr
			vpn.usedIPs = append(vpn.usedIPs, ipAddr)
			return ipAddr, nil
		}
	}

	return netip.Addr{}, errors.New("no available IP")
}

func (vpn *VPN) AddClient(pubkey wgtypes.Key, deviceSubnet net.IPNet) (netip.Addr, error) {
	peerIP, err := vpn.GetDeviceIP(pubkey)
	if err != nil {
		log.Printf("Cannot parse peerIP")
		return netip.Addr{}, err
	}
	err = vpn.wg.AddPeer(pubkey, peerIP, deviceSubnet)
	if err != nil {
		log.Printf("Cannot add peer ")
		return netip.Addr{}, err
	}

	subnet, err := netip.ParsePrefix(deviceSubnet.String())
	if err != nil {
		log.Printf("Cannot parse subnet")
		return netip.Addr{}, err
	}
	via, err := netip.ParseAddr(peerIP.String())
	if err != nil {
		log.Printf("Cannot parse via")
		return netip.Addr{}, err
	}

	err = routing.AddRouteToDeviceSubnet(subnet, via)
	if err != nil {
		return netip.Addr{}, err
	}

	vpn.pubkeyToSubnet[pubkey.String()] = subnet
	return peerIP, nil
}

func (vpn *VPN) RemoveClient(pubkey wgtypes.Key) error {
	err := vpn.wg.RemovePeer(pubkey)
	if err != nil {
		return err
	}

	ip := vpn.pubkeyToIP[pubkey.String()]
	delete(vpn.pubkeyToIP, pubkey.String())

	for i, addr := range vpn.usedIPs {
		if addr == ip {
			vpn.usedIPs = slices.Delete(vpn.usedIPs, i, i+1)
			break
		}
	}

	err = routing.RemoveRouteToSubnet(vpn.pubkeyToSubnet[pubkey.String()])
	if err != nil {
		return err
	}
	return nil
}

func (vpn *VPN) Start() {
	vpn.wg.CreateWireguardLink()
	vpn.wg.SetLinkUp()
	log.Printf("Created wireguard link %v\n", vpn.config.LinkName)

	log.Printf("HTTP server listening on %v\n", vpn.config.ListenAddr.String())
	http.HandleFunc("/register", vpn.registerHandler)
	http.HandleFunc("/unregister", vpn.unregisterHandler)
	http.ListenAndServe(vpn.config.ListenAddr.String(), nil)
}

func (vpn *VPN) Close() {
	vpn.wg.RemoveWireguardLink()
}
