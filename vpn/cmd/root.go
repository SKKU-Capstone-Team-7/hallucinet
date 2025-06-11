/*
Copyright © 2025 Hallucinet Team
*/
package cmd

import (
	"log"
	"net"
	"net/netip"
	"os"
	"os/signal"
	"syscall"

	"github.com/SKKU-Capstone-Team-7/hallucinet/vpn/internal/vpn"
	"github.com/SKKU-Capstone-Team-7/hallucinet/vpn/types"
	"github.com/spf13/cobra"
)

var listenAddr string

func startHallucinetVPN(cmd *cobra.Command, args []string) error {
	_, linkSubnet, err := net.ParseCIDR("10.18.0.0/16")
	if err != nil {
		log.Panicf("Cannot parse link subnet. %v\n", linkSubnet)
	}

	listenAddr, err := netip.ParseAddrPort("0.0.0.0:1337")
	if err != nil {
		log.Panicf("Cannot parse server address. %v\n", err)
	}

	config := types.Config{
		LinkSubnet:   *linkSubnet,
		LinkName:     "hallucinet0",
		WgListenPort: 55123,
		ListenAddr:   listenAddr,
	}

	vpn := vpn.New(config)

	go vpn.Start()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop
	vpn.Close()

	return nil
}

var rootCmd = &cobra.Command{
	Use:   "hallucinetvpn",
	Short: "Hallucinet VPN server",
	RunE:  startHallucinetVPN,
}

func Execute() {
	err := rootCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
}

func init() {
	rootCmd.Flags().StringVar(&listenAddr, "config", "0.0.0.0:1337", "")
}
