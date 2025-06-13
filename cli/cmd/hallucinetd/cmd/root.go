/*
Copyright © 2025 Hallucinet Team
*/
package cmd

import (
	"fmt"
	"log"
	"os"

	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/cmd/hallucinetd/internal/hallucinetd"
	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/internal/auth"
	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/internal/utils"
	"github.com/spf13/cobra"
)

var (
	tokenPath  string
	configPath string
)

var rootCmd = &cobra.Command{
	Use:   "hallucinetd",
	Short: "Hallucinet daemon",
	RunE:  startHallucinetDaemon,
}

func Execute() {
	err := rootCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
}

func init() {
	hallucinetDir := "/etc/hallucinet"

	defaultConfigPath := fmt.Sprintf("%s/config.json", hallucinetDir)
	rootCmd.Flags().StringVar(&configPath, "config", defaultConfigPath, "")

	defaultTokenPath := fmt.Sprintf("%s/token", hallucinetDir)
	rootCmd.Flags().StringVar(&tokenPath, "token", defaultTokenPath, "")
}

func EnableIPForwarding() error {
	const path = "/proc/sys/net/ipv4/ip_forward"
	return os.WriteFile(path, []byte("1"), 0644)
}

func startHallucinetDaemon(cmd *cobra.Command, args []string) error {
	err := EnableIPForwarding()
	if err != nil {
		return err
	}

	config, err := utils.ReadConfigFile(configPath)
	if err != nil {
		log.Printf("Cannot read config file %v. %v\n", configPath, err)
		return err
	}

	log.Printf("Waiting for valid authentication token...")
	auth.UntilAuthenticated(tokenPath)
	log.Printf("Authentication token is valid.")

	token, err := auth.Authenticate(tokenPath, config.Endpoint)
	if err != nil {
		log.Printf("Cannot decode device token. %v\n", err)
		return err
	}
	config.DeviceToken = token

	daemon, err := hallucinetd.New(config)
	if err != nil {
		log.Printf("Cannot start daemon. %v\n", err)
		return err
	}

	err = daemon.Start()
	if err != nil {
		return err
	}
	defer daemon.Close()

	return nil
}
