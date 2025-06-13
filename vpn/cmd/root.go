/*
Copyright © 2025 Hallucinet Team
*/
package cmd

import (
	"log"
	"net/netip"
	"os"
	"os/signal"
	"syscall"

	"github.com/SKKU-Capstone-Team-7/hallucinet/vpn/internal/vpn"
	"github.com/SKKU-Capstone-Team-7/hallucinet/vpn/types"
	"github.com/spf13/cobra"
)

var (
	listenAddr string
	linkAddr   = "172.28.0.1/16"
)

func EnableIPForwarding() error {
	const path = "/proc/sys/net/ipv4/ip_forward"
	return os.WriteFile(path, []byte("1"), 0644)
}

func startHallucinetVPN(cmd *cobra.Command, args []string) error {
	err := EnableIPForwarding()
	if err != nil {
		return err
	}

	listenAddr, err := netip.ParseAddrPort(listenAddr)
	if err != nil {
		log.Panicf("Cannot parse server address. %v\n", err)
		return err
	}
	linkAddr, err := netip.ParsePrefix(linkAddr)
	if err != nil {
		log.Panicf("Cannot parse link address. %v\n", err)
		return err
	}

	config := types.Config{
		LinkAddr:     linkAddr,
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
	rootCmd.Flags().StringVar(&listenAddr, "address", "0.0.0.0:1337", "")
}
