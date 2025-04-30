/*
Copyright © 2025 Hallucinet Team
*/
package cmd

import (
	"fmt"
	"log"
	"os"

	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/cmd/hallucinet/internal/hallucinet"
	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/internal/coordination"
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
		}

		coord, err := coordination.New(upOpts.configPath, upOpts.tokenPath)
		if err != nil {
			return err
		}
		devices, err := coord.GetDevices()
		if err != nil {
			return err
		}
		log.Printf("Devices: %v\n", devices)

		hallucinet := hallucinet.New(config)
		err = hallucinet.Start()
		if err != nil {
			log.Printf("Cannot start hallucinet. %v\n", err)
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
