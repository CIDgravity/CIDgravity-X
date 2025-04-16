package gemini

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/CIDgravity/Ticker/config"
	"github.com/CIDgravity/Ticker/internal/exchange"
	"github.com/CIDgravity/Ticker/pkg/http"
)

type Gemini struct {
	config exchange.ExchangeConfig
}

// GeminiResponse MarketData represents the JSON structure
type GeminiResponse struct {
	Bid    string         `json:"bid"`
	Ask    string         `json:"ask"`
	Last   string         `json:"last"`
	Volume map[string]any `json:"volume"` // contain the sell and ask currency + timestamp
}

func (r GeminiResponse) ToUnifiedResponse(exchangeName string, configPair string) (exchange.ExchangeFetchResponseForPair, error) {
	bidPrice, err := strconv.ParseFloat(r.Bid, 64)
	if err != nil {
		return exchange.ExchangeFetchResponseForPair{}, err
	}

	askPrice, err := strconv.ParseFloat(r.Ask, 64)
	if err != nil {
		return exchange.ExchangeFetchResponseForPair{}, err
	}

	// extract the volume from config pair
	// this will extract sell and ask symbols (because configPair is formatted SELL_ASK string)
	configPairSplitted := strings.Split(configPair, "_")
	if len(configPairSplitted) < 2 {
		return exchange.ExchangeFetchResponseForPair{}, fmt.Errorf("invalid config pair")
	}

	volumeSell, ok := r.Volume[configPairSplitted[0]]
	if !ok {
		return exchange.ExchangeFetchResponseForPair{}, fmt.Errorf("volume not found")
	}

	volumeSellStr, ok := volumeSell.(string)
	if !ok {
		return exchange.ExchangeFetchResponseForPair{}, fmt.Errorf("invalid volume found")
	}

	volumeSellFloat, err := strconv.ParseFloat(volumeSellStr, 64)
	if err != nil {
		return exchange.ExchangeFetchResponseForPair{}, err
	}

	return exchange.ExchangeFetchResponseForPair{
		Price:  (bidPrice + askPrice) / 2,
		Volume: volumeSellFloat,
	}, nil
}

func New() *Gemini {
	return &Gemini{
		config: exchange.ExchangeConfig{
			Name:     "Gemini",
			Endpoint: "https://api.gemini.com/v1/pubticker",
			Timeout:  "15s",
		},
	}
}

// SetBaseURL update the endpoint (used for testing purposes)
// Must not contains the ending slash
func (x *Gemini) SetBaseURL(baseURL string) {
	x.config.Endpoint = baseURL + "/v1/pubticker"
}

// GetName return exchange name
func (x *Gemini) GetName() string {
	return x.config.Name
}

func (x *Gemini) Fetch(pair string) (exchange.ExchangeFetchResponseForPair, error) {
	exchangePair, err := config.GetPairForPlatform(x.config.Name, pair)
	if err != nil {
		return exchange.ExchangeFetchResponseForPair{}, err
	}

	url := fmt.Sprintf("%s/%s", x.config.Endpoint, exchangePair)
	resp, err := http.ExecuteRequest[GeminiResponse](url, x.config.Timeout)

	if err != nil {
		return exchange.ExchangeFetchResponseForPair{}, err
	}

	return resp.ToUnifiedResponse(x.GetName(), pair)
}
