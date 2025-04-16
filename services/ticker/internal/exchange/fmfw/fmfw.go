package fmfw

import (
	"fmt"
	"strconv"
	"time"

	"github.com/CIDgravity/Ticker/config"
	"github.com/CIDgravity/Ticker/internal/exchange"
	"github.com/CIDgravity/Ticker/pkg/http"
)

type FMFW struct {
	config exchange.ExchangeConfig
}

type FMFWData struct {
	Ask         string    `json:"ask"`
	Bid         string    `json:"bid"`
	Last        string    `json:"last"`
	Low         string    `json:"low"`
	High        string    `json:"high"`
	Open        string    `json:"open"`
	Volume      string    `json:"volume"`
	VolumeQuote string    `json:"volume_quote"`
	Timestamp   time.Time `json:"timestamp"`
}

type CryptoTickers map[string]FMFWData

func (r CryptoTickers) ToUnifiedResponse(exchangeName string, configPair, exchangePair string) (exchange.ExchangeFetchResponseForPair, error) {
	data, ok := r[exchangePair]
	if !ok {
		return exchange.ExchangeFetchResponseForPair{}, fmt.Errorf("pair not found")
	}

	bidPrice, err := strconv.ParseFloat(data.Bid, 64)
	if err != nil {
		return exchange.ExchangeFetchResponseForPair{}, err
	}

	askPrice, err := strconv.ParseFloat(data.Ask, 64)
	if err != nil {
		return exchange.ExchangeFetchResponseForPair{}, err
	}

	volume, err := strconv.ParseFloat(data.Volume, 64)
	if err != nil {
		return exchange.ExchangeFetchResponseForPair{}, err
	}

	return exchange.ExchangeFetchResponseForPair{
		Price:  (bidPrice + askPrice) / 2,
		Volume: volume,
	}, nil
}

func New() *FMFW {
	return &FMFW{
		config: exchange.ExchangeConfig{
			Name:     "FMFW.io",
			Endpoint: "https://api.fmfw.io/api/3/public/ticker",
			Timeout:  "15s",
		},
	}
}

// SetBaseURL update the endpoint (used for testing purposes)
// Must not contains the ending slash
func (x *FMFW) SetBaseURL(baseURL string) {
	x.config.Endpoint = baseURL + "/3/public/ticker"
}

// GetName return exchange name
func (x *FMFW) GetName() string {
	return x.config.Name
}

// Fetch return response for current pair with an unified response format
func (x *FMFW) Fetch(pair string) (exchange.ExchangeFetchResponseForPair, error) {
	exchangePair, err := config.GetPairForPlatform(x.config.Name, pair)
	if err != nil {
		return exchange.ExchangeFetchResponseForPair{}, err
	}

	url := fmt.Sprintf("%s?symbols=%s", x.config.Endpoint, exchangePair)
	resp, err := http.ExecuteRequest[CryptoTickers](url, x.config.Timeout)
	if err != nil {
		return exchange.ExchangeFetchResponseForPair{}, err
	}

	return resp.ToUnifiedResponse(x.GetName(), pair, exchangePair)
}
