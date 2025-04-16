package config

import (
	"errors"
	"fmt"
	"os"

	"github.com/CIDgravity/Ticker/pkg/database/mongo"

	"github.com/CIDgravity/snakelet"
)

type Config struct {
	API      APIConfig      `mapstructure:"API"`
	Logs     LogsConfig     `mapstructure:"LOGS"`
	Database mongo.Config   `mapstructure:"DATABASE"`
	Exchange ExchangeConfig `mapstructure:"EXCHANGE"`
}

type APIConfig struct {
	ListenPort string `mapstructure:"ListenPort"`
}

type LogsConfig struct {
	Level            string `mapstructure:"Level"` // error | warn | info - case insensitive
	OutputLogsAsJSON bool   `mapstructure:"OutputLogsAsJSON"`
}

type ExchangeConfig struct {
	PairsToFetch                []string `mapstructure:"PairsToFetch"` // error | warn | info - case insensitive
	FetchPeriod                 string   `mapstructure:"FetchPeriod"`
	MaxParallelExchangesToFetch int      `mapstructure:"MaxParallelExchangesToFetch"`
}

func GetDefaultConfig() *Config {
	return &Config{
		API: APIConfig{
			ListenPort: "3047",
		},
		Logs: LogsConfig{
			Level:            "debug",
			OutputLogsAsJSON: false,
		},
		Database: mongo.Config{
			ConnectionTimeout: "10s",
			MaxConnection:     200,
			RequestTimeout:    "",
			SlowThresholdLogs: "10ms",
		},
		Exchange: ExchangeConfig{
			PairsToFetch: []string{
				"FIL_USD",
			},
			FetchPeriod:                 "60s",
			MaxParallelExchangesToFetch: 6,
		},
	}
}

func NewConfigFromFile(configDir string, fileName string) (*Config, error) {
	configFilePath := configDir + "/" + fileName

	if _, err := os.Stat(configFilePath); errors.Is(err, os.ErrNotExist) {
		if _, err := os.Stat(fileName); errors.Is(err, os.ErrNotExist) {
			return nil, fmt.Errorf("Couldn't open " + fileName)
		} else {
			configFilePath = fileName
		}
	}

	// First we need to load the file
	conf := GetDefaultConfig()
	_, err := snakelet.InitAndLoad(conf, configFilePath)

	if err != nil {
		return nil, fmt.Errorf("error while loading configuration file")
	}

	return conf, nil
}
