package crypto

import (
	"fmt"
	"strconv"

	"github.com/CIDgravity/Ticker/config"
	"github.com/CIDgravity/Ticker/internal/exchange"
	"github.com/CIDgravity/Ticker/pkg/http"
)

type Crypto struct {
	config exchange.ExchangeConfig
}

type CryptoResponse struct {
	Result CryptoResult `json:"result"`
}

// CryptoResult represents the detailed market data
type CryptoResult struct {
	Data []CryptoData `json:"data"`
}

type CryptoData struct {
	HighPrice      string `json:"h"`  // Price of the 24h highest trade
	LowPrice       string `json:"l"`  // Price of the 24h lowest trade
	LatestPrice    string `json:"a"`  // The price of the latest trade
	Instrument     string `json:"i"`  // Instrument name
	Volume         string `json:"v"`  // The total 24h traded volume
	VolumeValue    string `json:"vv"` // The total 24h traded volume value (in USD)
	OpenInterest   string `json:"oi"` // Open interest
	PriceChange24h string `json:"c"`  // 24-hour price change
	BestBidPrice   string `json:"b"`  // The current best bid price
	BestAskPrice   string `json:"k"`  // The current best ask price
	Timestamp      int64  `json:"t"`  // Timestamp
}

func (r CryptoResponse) ToUnifiedResponse(exchangeName string, configPair string) (exchange.ExchangeFetchResponseForPair, error) {

	// parse string values to float for calculation
	bestBidPrice, err := strconv.ParseFloat(r.Result.Data[0].BestBidPrice, 64)
	if err != nil {
		return exchange.ExchangeFetchResponseForPair{}, err
	}

	bestAskPrice, err := strconv.ParseFloat(r.Result.Data[0].BestAskPrice, 64)
	if err != nil {
		return exchange.ExchangeFetchResponseForPair{}, err
	}

	volume, err := strconv.ParseFloat(r.Result.Data[0].Volume, 64)
	if err != nil {
		return exchange.ExchangeFetchResponseForPair{}, err
	}

	return exchange.ExchangeFetchResponseForPair{
		Price:  (bestBidPrice + bestAskPrice) / 2,
		Volume: volume,
	}, nil
}

func New() *Crypto {
	return &Crypto{
		config: exchange.ExchangeConfig{
			Name:     "Crypto.com",
			Endpoint: "https://api.crypto.com/exchange/v1/public/get-tickers",
			Timeout:  "15s",
		},
	}
}

// SetBaseURL update the endpoint (used for testing purposes)
// Must not contains the ending slash
func (x *Crypto) SetBaseURL(baseURL string) {
	x.config.Endpoint = baseURL + "/exchange/v1/public/get-tickers"
}

// GetName return exchange name
func (x *Crypto) GetName() string {
	return x.config.Name
}

func (x *Crypto) Fetch(pair string) (exchange.ExchangeFetchResponseForPair, error) {
	exchangePair, err := config.GetPairForPlatform(x.config.Name, pair)
	if err != nil {
		return exchange.ExchangeFetchResponseForPair{}, err
	}

	url := fmt.Sprintf("%s?instrument_name=%s", x.config.Endpoint, exchangePair)
	resp, err := http.ExecuteRequest[CryptoResponse](url, x.config.Timeout)

	if err != nil {
		return exchange.ExchangeFetchResponseForPair{}, err
	}

	return resp.ToUnifiedResponse(x.GetName(), pair)
}
