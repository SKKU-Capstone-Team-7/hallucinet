/*
Copyright © 2025 Hallucinet Team
*/
package cmd

import (
	"fmt"
	"log"

	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/cmd/hallucinet/internal/hallucinet"
	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/internal/utils"
	"github.com/spf13/cobra"
)

var downOpts = struct {
	tokenPath  string
	configPath string
}{}

var downCmd = &cobra.Command{
	Use:   "down",
	Short: "Stop hallucinet",
	RunE: func(cmd *cobra.Command, args []string) error {
		config, err := utils.ReadConfigFile(downOpts.configPath)
		if err != nil {
			log.Printf("Cannot read config file %v. %v\n", downOpts.configPath, err)
		}

		hallucinet := hallucinet.New(config)
		err = hallucinet.Stop()
		if err != nil {
			log.Printf("Cannot stop hallucinet. %v\n", err)
		}

		log.Printf("Hallucinet stopped.")

		return err
	},
}

func init() {
	rootCmd.AddCommand(downCmd)

	hallucinetDir := "/etc/hallucinet"

	defaultConfigPath := fmt.Sprintf("%s/config.json", hallucinetDir)
	downCmd.Flags().StringVar(&downOpts.configPath, "config", defaultConfigPath, "")

	defaultTokenPath := fmt.Sprintf("%s/token", hallucinetDir)
	downCmd.Flags().StringVar(&downOpts.tokenPath, "token", defaultTokenPath, "")
}
