package cex

import (
	"fmt"
	"strconv"

	"github.com/CIDgravity/Ticker/config"
	"github.com/CIDgravity/Ticker/internal/exchange"
	"github.com/CIDgravity/Ticker/pkg/http"
)

type CEX struct {
	config exchange.ExchangeConfig
}

type CEXResponse struct {
	Data map[string]CEXTickerData `json:"data"`
}

type CEXTickerData struct {
	BestBid                 string `json:"bestBid"`
	BestAsk                 string `json:"bestAsk"`
	BestBidChange           string `json:"bestBidChange"`
	BestBidChangePercentage string `json:"bestBidChangePercentage"`
	BestAskChange           string `json:"bestAskChange"`
	BestAskChangePercentage string `json:"bestAskChangePercentage"`
	Volume30d               string `json:"volume30d"`
	Low                     string `json:"low"`
	High                    string `json:"high"`
	Volume                  string `json:"volume"`
	QuoteVolume             string `json:"quoteVolume"`
	LastTradeVolume         string `json:"lastTradeVolume"`
	Last                    string `json:"last"`
	LastTradePrice          string `json:"lastTradePrice"`
	PriceChange             string `json:"priceChange"`
	PriceChangePercentage   string `json:"priceChangePercentage"`
	LastTradeDateISO        string `json:"lastTradeDateISO"`
	VolumeUSD               string `json:"volumeUSD"`
}

func (r CEXResponse) ToUnifiedResponse(exchangeName string, configPair, exchangePair string) (exchange.ExchangeFetchResponseForPair, error) {
	result, ok := r.Data[exchangePair]

	if !ok {
		return exchange.ExchangeFetchResponseForPair{}, fmt.Errorf("pair not found in response")
	}

	// parse string values to float for calculation
	bestAsk, err := strconv.ParseFloat(result.BestAsk, 64)
	if err != nil {
		return exchange.ExchangeFetchResponseForPair{}, err
	}

	bestBid, err := strconv.ParseFloat(result.BestBid, 64)
	if err != nil {
		return exchange.ExchangeFetchResponseForPair{}, err
	}

	lastTradeVolume, err := strconv.ParseFloat(result.LastTradeVolume, 64)
	if err != nil {
		return exchange.ExchangeFetchResponseForPair{}, err
	}

	return exchange.ExchangeFetchResponseForPair{
		Price:  (bestBid + bestAsk) / 2,
		Volume: lastTradeVolume,
	}, nil
}

func New() *CEX {
	return &CEX{
		config: exchange.ExchangeConfig{
			Name:     "CEX.io",
			Endpoint: "https://trade.cex.io/api/spot/rest-public/get_ticker",
			Timeout:  "15s",
		},
	}
}

// SetBaseURL update the endpoint (used for testing purposes)
// Must not contains the ending slash
func (x *CEX) SetBaseURL(baseURL string) {
	x.config.Endpoint = baseURL + "/api/spot/rest-public/get_ticker"
}

// GetName return exchange name
func (x *CEX) GetName() string {
	return x.config.Name
}

func (x *CEX) Fetch(pair string) (exchange.ExchangeFetchResponseForPair, error) {
	exchangePair, err := config.GetPairForPlatform(x.config.Name, pair)
	if err != nil {
		return exchange.ExchangeFetchResponseForPair{}, err
	}

	url := fmt.Sprintf("%s?pairs[]=%s", x.config.Endpoint, exchangePair)
	resp, err := http.ExecuteRequest[CEXResponse](url, x.config.Timeout)

	if err != nil {
		return exchange.ExchangeFetchResponseForPair{}, err
	}

	return resp.ToUnifiedResponse(x.GetName(), pair, exchangePair)
}
