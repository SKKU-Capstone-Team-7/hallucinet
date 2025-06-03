/*
Copyright © 2025 Hallucinet Team
*/
package cmd

import (
	"fmt"
	"log"

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

		token, err := auth.Authenticate(upOpts.tokenPath, config.Endpoint)
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

	hallucinetDir := "/etc/hallucinet"

	defaultConfigPath := fmt.Sprintf("%s/config.json", hallucinetDir)
	upCmd.Flags().StringVar(&upOpts.configPath, "config", defaultConfigPath, "")

	defaultTokenPath := fmt.Sprintf("%s/token", hallucinetDir)
	upCmd.Flags().StringVar(&upOpts.tokenPath, "token", defaultTokenPath, "")
}
