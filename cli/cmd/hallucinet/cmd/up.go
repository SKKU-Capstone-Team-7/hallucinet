/*
Copyright © 2025 Hallucinet Team
*/
package cmd

import (
	"fmt"
	"log"
	"os"

	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/cmd/hallucinet/internal/hallucinet"
	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/internal/auth"
	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/internal/utils"
	"github.com/spf13/cobra"
)

var upOpts = struct {
	tokenPath  string
	configPath string
}{}

var upCmd = &cobra.Command{
	Use:   "up",
	Short: "Start hallucinet",
	RunE: func(cmd *cobra.Command, args []string) error {
		config, err := utils.ReadConfigFile(upOpts.configPath)
		if err != nil {
			log.Printf("Cannot read config file %v. %v\n", upOpts.configPath, err)
			return err
		}

		tokenString, err := os.ReadFile(upOpts.tokenPath)
		if err != nil {
			log.Printf("Cannot read token file %v. %v\n", upOpts.tokenPath, err)
			return err
		}

		token, err := auth.DecodeDeviceToken(string(tokenString))
		if err != nil {
			log.Printf("Cannot decode device token. %v\n", err)
			return err
		}
		config.DeviceToken = token

		hallucinet := hallucinet.New(config)
		err = hallucinet.Start()
		if err != nil {
			log.Printf("Cannot start hallucinet. %v\n", err)
			return err
		}

		log.Printf("Hallucinet started.")

		return err
	},
}

func init() {
	rootCmd.AddCommand(upCmd)

	homeDir, err := os.UserHomeDir()
	if err != nil {
		log.Panicf("Cannot read user home directory. %v\n", homeDir)
	}

	defaultConfigPath := fmt.Sprintf("%s/.hallucinet/config.json", homeDir)
	upCmd.Flags().StringVar(&upOpts.configPath, "config", defaultConfigPath, "")

	defaultTokenPath := fmt.Sprintf("%s/.hallucinet/token", homeDir)
	upCmd.Flags().StringVar(&upOpts.tokenPath, "token", defaultTokenPath, "")
}
