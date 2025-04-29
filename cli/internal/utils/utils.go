package utils

import (
	"encoding/json"
	"log"
	"os"

	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/types"
)

func ReadConfigFile(path string) (types.Config, error) {
	configContent, err := os.ReadFile(path)
	if err != nil {
		log.Printf("Cannot read config file. %v\n", err)
		return types.Config{}, err
	}

	var config types.Config
	err = json.Unmarshal(configContent, &config)
	if err != nil {
		log.Printf("Cannot unmarshal content of %v. %v\n", path, err)
		return types.Config{}, err
	}

	return config, nil
}

func ReadTokenFile(path string) (string, error) {
	token, err := os.ReadFile(path)
	if err != nil {
		log.Printf("Cannot read token file. %v\n", err)
		return "", err
	}

	return string(token), nil
}
