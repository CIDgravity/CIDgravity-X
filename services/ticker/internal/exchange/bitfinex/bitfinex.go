package bitfinex

import (
	"fmt"
	"strconv"

	"github.com/CIDgravity/Ticker/config"
	"github.com/CIDgravity/Ticker/internal/exchange"
	"github.com/CIDgravity/Ticker/pkg/http"
)

type Bitfinex struct {
	config exchange.ExchangeConfig
}

type BitfinexResponse struct {
	Mid       string `json:"mid"`
	Bid       string `json:"bid"`
	Ask       string `json:"ask"`
	LastPrice string `json:"last_price"`
	Low       string `json:"low"`
	High      string `json:"high"`
	Volume    string `json:"volume"`
	Timestamp string `json:"timestamp"`
}

func (r BitfinexResponse) ToUnifiedResponse(exchangeName string, configPair string) (exchange.ExchangeFetchResponseForPair, error) {
	midPrice, err := strconv.ParseFloat(r.Mid, 64)
	if err != nil {
		return exchange.ExchangeFetchResponseForPair{}, err
	}

	volume, err := strconv.ParseFloat(r.Volume, 64)
	if err != nil {
		return exchange.ExchangeFetchResponseForPair{}, err
	}

	return exchange.ExchangeFetchResponseForPair{
		Price:  midPrice,
		Volume: volume,
	}, nil
}

func New() *Bitfinex {
	return &Bitfinex{
		config: exchange.ExchangeConfig{
			Name:     "Bitfinex",
			Endpoint: "https://api.bitfinex.com/v1/pubticker/",
			Timeout:  "15s",
		},
	}
}

// SetBaseURL update the endpoint (used for testing purposes)
// Must not contains the ending slash
func (x *Bitfinex) SetBaseURL(baseURL string) {
	x.config.Endpoint = baseURL + "/v1/pubticker"
}

// GetName return exchange name
func (x *Bitfinex) GetName() string {
	return x.config.Name
}

// Fetch return a map with each pair with an unified response format
func (x *Bitfinex) Fetch(pair string) (exchange.ExchangeFetchResponseForPair, error) {
	exchangePair, err := config.GetPairForPlatform(x.config.Name, pair)
	if err != nil {
		return exchange.ExchangeFetchResponseForPair{}, err
	}

	url := fmt.Sprintf("%s/%s", x.config.Endpoint, exchangePair)
	resp, err := http.ExecuteRequest[BitfinexResponse](url, x.config.Timeout)
	if err != nil {
		return exchange.ExchangeFetchResponseForPair{}, err
	}

	return resp.ToUnifiedResponse(x.GetName(), pair)
}
