package vpn

import (
	"encoding/json"
	"io"
	"log"
	"net/http"

	"github.com/SKKU-Capstone-Team-7/hallucinet/vpn/internal/wireguard"
	"github.com/SKKU-Capstone-Team-7/hallucinet/vpn/types"
)

type VPN struct {
	config types.Config
	wg     wireguard.Wireguard
}

func New(config types.Config) VPN {
	wg := wireguard.New(config)
	return VPN{
		config: config,
		wg:     wg,
	}
}

type ReqBody struct {
	Pubkey string `json:"pubkey"`
	Subnet string `json:"subnet"`
}
type Response struct {
	Pubkey string `json:"pubkey"`
}

func (vpn *VPN) httpHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var form ReqBody
	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.Panicf("Cannot read request body. %v\n", r)
	}

	err = json.Unmarshal(body, &form)
	if err != nil {
		log.Panicf("Cannot unmarshal request body. %v\n", err)
	}

	res, err := json.Marshal(Response{
		Pubkey: vpn.wg.Device.PublicKey.String(),
	})
	if err != nil {
		log.Panicf("Cannot marshal response. %v\n", err)
	}

	_, err = w.Write(res)
	if err != nil {
		log.Panicf("Cannot write response. %v\n", err)
	}
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
