package config_test

import (
	"testing"

	"github.com/CIDgravity/Ticker/config"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	internalTesting "github.com/CIDgravity/Ticker/pkg/testing"
)

func TestConfig(t *testing.T) {
	t.Run("default_config", func(t *testing.T) {
		conf := config.GetDefaultConfig()

		assert.Equal(t, "3047", conf.API.ListenPort)
		assert.Equal(t, "debug", conf.Logs.Level)
		assert.False(t, conf.Logs.OutputLogsAsJSON)
		assert.Equal(t, []string{"FIL_USD"}, conf.Exchange.PairsToFetch)
		assert.Equal(t, "60s", conf.Exchange.FetchPeriod)
		assert.Equal(t, 6, conf.Exchange.MaxParallelExchangesToFetch)
	})

	t.Run("file_not_found", func(t *testing.T) {
		_, err := config.NewConfigFromFile("/nonexistent", "config.toml")
		require.Error(t, err)

		assert.Contains(t, err.Error(), "Couldn't open config.toml")
	})

	t.Run("invalid_config_file", func(t *testing.T) {
		path := internalTesting.GetTestPathForData(t, "test_data")

		conf, err := config.NewConfigFromFile(path, "invalid_config.toml")
		require.Error(t, err)

		assert.Nil(t, conf)
		assert.Contains(t, err.Error(), "error while loading configuration file")
	})

	t.Run("success", func(t *testing.T) {
		path := internalTesting.GetTestPathForData(t, "test_data")

		conf, err := config.NewConfigFromFile(path, "valid_config.toml")
		require.NoError(t, err)

		assert.Equal(t, "8080", conf.API.ListenPort)
		assert.Equal(t, "error", conf.Logs.Level)
		assert.True(t, conf.Logs.OutputLogsAsJSON)
		assert.Equal(t, []string{"FIL_USD"}, conf.Exchange.PairsToFetch)
		assert.Equal(t, "60s", conf.Exchange.FetchPeriod)
		assert.Equal(t, "10s", conf.Database.ConnectionTimeout)
		assert.Equal(t, uint64(200), conf.Database.MaxConnection)
	})
}
