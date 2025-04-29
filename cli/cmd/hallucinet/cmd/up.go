/*
Copyright © 2025 Hallucinet Team
*/
package cmd

import (
	"fmt"
	"log"
	"os"

	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/internal/coordination"
	"github.com/spf13/cobra"
)

var (
	configPath string
	tokenPath  string
)

// upCmd represents the up command
var upCmd = &cobra.Command{
	Use:   "up",
	Short: "A brief description of your command",
	Long: `A longer description that spans multiple lines and likely contains examples
and usage of using your command. For example:

Cobra is a CLI library for Go that empowers applications.
This application is a tool to generate the needed files
to quickly create a Cobra application.`,
	RunE: func(cmd *cobra.Command, args []string) error {
		coord, err := coordination.New(configPath, tokenPath)
		if err != nil {
			return err
		}

		coord.GetDevices()
		return nil
	},
}

func init() {
	rootCmd.AddCommand(upCmd)

	// Configuration file path
	homeDir, err := os.UserHomeDir()
	if err != nil {
		log.Panicf("Cannot read user home directory. %v\n", homeDir)
	}

	defaultConfigPath := fmt.Sprintf("%s/.hallucinet/config.json", homeDir)
	upCmd.Flags().StringVar(&configPath, "config", defaultConfigPath, "")

	defaultTokenPath := fmt.Sprintf("%s/.hallucinet/token", homeDir)
	upCmd.Flags().StringVar(&tokenPath, "token", defaultTokenPath, "")

	// Token file path
}
