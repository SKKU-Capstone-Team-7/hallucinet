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
	homeDir, err := os.UserHomeDir()
	if err != nil {
		log.Panicf("Cannot read user home directory. %v\n", homeDir)
	}

	defaultConfigPath := fmt.Sprintf("%s/.hallucinet/config.json", homeDir)
	rootCmd.Flags().StringVar(&configPath, "config", defaultConfigPath, "")

	defaultTokenPath := fmt.Sprintf("%s/.hallucinet/token", homeDir)
	rootCmd.Flags().StringVar(&tokenPath, "token", defaultTokenPath, "")
}

func startHallucinetDaemon(cmd *cobra.Command, args []string) error {
	config, err := utils.ReadConfigFile(configPath)
	if err != nil {
		log.Printf("Cannot read config file %v. %v\n", configPath, err)
		return err
	}

	token, err := auth.Authenticate(tokenPath)
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

	daemon.Start()

	return nil
}
