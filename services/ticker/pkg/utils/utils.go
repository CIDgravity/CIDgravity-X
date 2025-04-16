package utils

import (
	"github.com/CIDgravity/Ticker/internal/exchange"
	logs "github.com/CIDgravity/Ticker/pkg/logger"
)

func CalculateWeightedPriceForPair(exchangesResponseForPair []exchange.ExchangeResponseDatabase[exchange.ExchangeFetchResponseForPair]) float64 {
	var totalVolume, weightedSum float64

	for _, exchangeResponse := range exchangesResponseForPair {
		if exchangeResponse.Data.Volume < 0 || exchangeResponse.Data.Price < 0 {
			logs.Warning(logs.LogParams{
				Message: "Exchange as negative price or volume. Skip it because considered as invalid data",
				Params: map[string]interface{}{
					"price":  exchangeResponse.Data.Price,
					"volume": exchangeResponse.Data.Volume,
				},
			})

			continue
		}

		weightedSum += exchangeResponse.Data.Price * exchangeResponse.Data.Volume
		totalVolume += exchangeResponse.Data.Volume
	}

	// Retourner le prix moyen pondéré global
	if totalVolume == 0 {
		return 0
	}

	return weightedSum / totalVolume
}
