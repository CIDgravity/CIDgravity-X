package service

import (
	"runtime/debug"
	"time"

	"github.com/CIDgravity/Ticker/config"
	"github.com/CIDgravity/Ticker/internal/exchange"
	"github.com/remeh/sizedwaitgroup"

	"github.com/CIDgravity/Ticker/repository"

	"github.com/CIDgravity/Ticker/pkg/json"
	logs "github.com/CIDgravity/Ticker/pkg/logger"
	"github.com/CIDgravity/Ticker/pkg/utils"

	// import all exchanges
	"github.com/CIDgravity/Ticker/internal/exchange/bitfinex"
	cex "github.com/CIDgravity/Ticker/internal/exchange/cex.io"
	crypto "github.com/CIDgravity/Ticker/internal/exchange/crypto.com"
	"github.com/CIDgravity/Ticker/internal/exchange/fmfw"
	"github.com/CIDgravity/Ticker/internal/exchange/gemini"
	"github.com/CIDgravity/Ticker/internal/exchange/kraken"
)

type ExchangeService interface {
	GetLatestTickers() ([]exchange.ExchangeResponseDatabase[map[string]exchange.ExchangeFetchResponseForPair], error)
	GetLatestTickersForPair(pair string) (exchange.TickersWithWeighted, error)
	FetchExchanges()
}

type exchangeService struct {
	exchanges  []exchange.Exchange
	repository repository.ExchangeRepository
	config     config.Config
}

func NewExchangeService(repository repository.ExchangeRepository, cfg config.Config) ExchangeService {
	return exchangeService{
		exchanges: []exchange.Exchange{
			gemini.New(),
			kraken.New(),
			crypto.New(),
			bitfinex.New(),
			cex.New(),
			fmfw.New(),
		},
		repository: repository,
		config:     cfg,
	}
}

// GetLatestTickers return all latest tickers for all pairs
func (s exchangeService) GetLatestTickers() ([]exchange.ExchangeResponseDatabase[map[string]exchange.ExchangeFetchResponseForPair], error) {
	results, _, err := s.repository.FetchLatestTickers()

	if err != nil {
		logs.Error(logs.LogParams{
			Message:    "Unable to get all latest tickers",
			Stacktrace: debug.Stack(),
			Error:      err,
		})

		return results, err
	}

	return results, nil
}

// GetLatestTickersForPair return all latest tickers for specific pair
func (s exchangeService) GetLatestTickersForPair(pair string) (exchange.TickersWithWeighted, error) {
	results, _, err := s.repository.FetchLatestTickersForSpecificPair(pair)

	if err != nil {
		logs.Error(logs.LogParams{
			Message:    "Unable to get all latest tickers for specific pair: " + pair,
			Stacktrace: debug.Stack(),
			Error:      err,
		})

		return exchange.TickersWithWeighted{}, err
	}

	// Post processing and weighted price calculation
	return exchange.TickersWithWeighted{
		Pair:          pair,
		Tickers:       results,
		WeightedPrice: utils.CalculateWeightedPriceForPair(results),
	}, nil
}

// FetchExchanges will be called by a cron job
// It will fetch for all exchange and all pairs and add a row into mongo database
// Note: because all exchanges doesn't support fetching multiple pair, we need to loop over all pairs to fetch
func (s exchangeService) FetchExchanges() {
	swg := sizedwaitgroup.New(s.config.Exchange.MaxParallelExchangesToFetch)

	for _, ex := range s.exchanges {
		ex := ex // capture range variable
		swg.Add()

		go func(ex exchange.Exchange) {
			defer swg.Done()

			results := make(map[string]exchange.ExchangeFetchResponseForPair, 0)
			for _, pair := range s.config.Exchange.PairsToFetch {
				data, err := ex.Fetch(pair)
				if err != nil {
					logs.Error(logs.LogParams{
						Message:    "Unable to fetch data from exchange " + ex.GetName() + " for pair " + pair,
						Stacktrace: debug.Stack(),
						Error:      err,
					})
					continue
				}

				logs.Info(logs.LogParams{
					Message: "Successfully fetched data from " + ex.GetName() + " for pair " + pair,
					Params: map[string]any{
						"result": json.OneLiner(data),
					},
				})

				results[pair] = data
			}

			if len(results) > 0 {
				exchangeData := exchange.ExchangeResponseDatabase[map[string]exchange.ExchangeFetchResponseForPair]{
					Exchange:  ex.GetName(),
					Data:      results,
					FetchedAt: time.Now().UnixMilli(),
				}

				err := s.repository.InsertSingle(exchangeData)
				if err != nil {
					logs.Error(logs.LogParams{
						Message:    "Unable to store batch data to database from exchange " + ex.GetName(),
						Stacktrace: debug.Stack(),
						Error:      err,
					})
				} else {
					logs.Info(logs.LogParams{
						Message: "Successfully stored batch data for exchange " + ex.GetName(),
						Params: map[string]any{
							"count": len(results),
						},
					})
				}
			}
		}(ex)
	}

	logs.Debug(logs.LogParams{Message: "All exchange fetch jobs started. Waiting for completion..."})
	swg.Wait()
	logs.Debug(logs.LogParams{Message: "All exchange fetch jobs completed."})
}
