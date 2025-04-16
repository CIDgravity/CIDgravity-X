package config

import "fmt"

// ExchangePairs define the matching between standard pair and pairs for each exchange
// Can be updated when we want to add a new exchange to the app
// Note: the first value must be the exact same for all exchanges, the second one can differ by platform
var ExchangePairs = map[string]map[string]string{
	"Kraken": {
		"FIL_USD": "FILUSD",
	},
	"Bitfinex": {
		"FIL_USD": "tFILUSD",
	},
	"Crypto.com": {
		"FIL_USD": "FIL_USD",
	},
	"Gemini": {
		"FIL_USD": "filusd",
	},
	"CEX.io": {
		"FIL_USD": "FIL-USD",
	},
	"FMFW.io": {
		"FIL_USD": "FILUSDT",
	},
}

func GetPairForPlatform(exchangeName string, pair string) (string, error) {
	val, ok := ExchangePairs[exchangeName][pair]
	if !ok {
		return "", fmt.Errorf("pair not found")
	}

	return val, nil
}
