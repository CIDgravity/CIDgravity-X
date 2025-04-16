package utils_test

import (
	"testing"

	"github.com/CIDgravity/Ticker/internal/exchange"
	"github.com/CIDgravity/Ticker/pkg/utils"
	"github.com/stretchr/testify/assert"
)

func TestCalculateWeightedPriceForPair(t *testing.T) {
	t.Run("valid weighted price calculation", func(t *testing.T) {
		exchangesResponseForPair := []exchange.ExchangeResponseDatabase[exchange.ExchangeFetchResponseForPair]{
			{Exchange: "exchange1", Data: exchange.ExchangeFetchResponseForPair{Price: 10.0, Volume: 100.0}},
			{Exchange: "exchange2", Data: exchange.ExchangeFetchResponseForPair{Price: 20.0, Volume: 200.0}},
			{Exchange: "exchange3", Data: exchange.ExchangeFetchResponseForPair{Price: 30.0, Volume: 300.0}},
		}

		// Expected result
		expected := (10.0*100.0 + 20.0*200.0 + 30.0*300.0) / (100.0 + 200.0 + 300.0)
		result := utils.CalculateWeightedPriceForPair(exchangesResponseForPair)
		assert.Equal(t, expected, result)
	})

	t.Run("no volume (totalVolume == 0)", func(t *testing.T) {
		exchangesResponseForPair := []exchange.ExchangeResponseDatabase[exchange.ExchangeFetchResponseForPair]{
			{Exchange: "exchange1", Data: exchange.ExchangeFetchResponseForPair{Price: 10.0, Volume: 0.0}},
			{Exchange: "exchange2", Data: exchange.ExchangeFetchResponseForPair{Price: 20.0, Volume: 0.0}},
			{Exchange: "exchange3", Data: exchange.ExchangeFetchResponseForPair{Price: 30.0, Volume: 0.0}},
		}

		// Expected result
		expected := 0.0
		result := utils.CalculateWeightedPriceForPair(exchangesResponseForPair)
		assert.Equal(t, expected, result)
	})

	t.Run("single exchange volume", func(t *testing.T) {
		exchangesResponseForPair := []exchange.ExchangeResponseDatabase[exchange.ExchangeFetchResponseForPair]{
			{Exchange: "exchange1", Data: exchange.ExchangeFetchResponseForPair{Price: 50.0, Volume: 100.0}},
		}

		// Expected result
		expected := 50.0
		result := utils.CalculateWeightedPriceForPair(exchangesResponseForPair)
		assert.Equal(t, expected, result)
	})

	t.Run("multiple exchanges with negative volume", func(t *testing.T) {
		exchangesResponseForPair := []exchange.ExchangeResponseDatabase[exchange.ExchangeFetchResponseForPair]{
			{Exchange: "exchange1", Data: exchange.ExchangeFetchResponseForPair{Price: 10.0, Volume: -100.0}},
			{Exchange: "exchange2", Data: exchange.ExchangeFetchResponseForPair{Price: 20.0, Volume: 200.0}},
		}

		// Expected result
		expected := (20.0 * 200.0) / 200.0
		result := utils.CalculateWeightedPriceForPair(exchangesResponseForPair)
		assert.Equal(t, expected, result)
	})
}
