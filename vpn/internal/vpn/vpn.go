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

	"github.com/SKKU-Capstone-Team-7/hallucinet/vpn/internal/wireguard"
	"github.com/SKKU-Capstone-Team-7/hallucinet/vpn/types"
	"github.com/korylprince/ipnetgen"
	"github.com/vishvananda/netlink"
	"golang.zx2c4.com/wireguard/wgctrl/wgtypes"
)

type VPN struct {
	config     types.Config
	usedIPs    []netip.Addr // Use this because it's comparable
	pubkeyToIP map[string]netip.Addr
	wg         wireguard.Wireguard
}

func New(config types.Config) VPN {
	wg := wireguard.New(config)
	return VPN{
		config:     config,
		wg:         wg,
		pubkeyToIP: map[string]netip.Addr{},
		usedIPs: []netip.Addr{
			config.LinkAddr.Masked().Addr(),
			config.LinkAddr.Addr(),
		},
	}
}

type ReqBody struct {
	Pubkey string `json:"pubkey"`
	Subnet string `json:"subnet"`
}
type Response struct {
	Pubkey string `json:"pubkey"`
	IP     string `json:"ip"`
}

func (vpn *VPN) httpHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var form ReqBody
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
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	res, err := json.Marshal(Response{
		Pubkey: vpn.wg.Device.PublicKey.String(),
		IP:     devIP.String(),
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
		return netip.Addr{}, err
	}
	err = vpn.wg.AddPeer(pubkey, peerIP)
	if err != nil {
		return netip.Addr{}, err
	}
	return peerIP, nil
}

func (vpn *VPN) Start() {
	vpn.wg.CreateWireguardLink()
	vpn.wg.SetLinkUp()
	log.Printf("Created wireguard link %v\n", vpn.config.LinkName)

	log.Printf("HTTP server listening on %v\n", vpn.config.ListenAddr.String())
	http.HandleFunc("/register", vpn.httpHandler)
	http.ListenAndServe(vpn.config.ListenAddr.String(), nil)
}

func (vpn *VPN) Close() {
	vpn.wg.RemoveWireguardLink()
}
