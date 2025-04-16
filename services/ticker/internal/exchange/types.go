package exchange

type TickersWithWeighted struct {
	Pair          string                                                   `json:"pair"`
	Tickers       []ExchangeResponseDatabase[ExchangeFetchResponseForPair] `json:"tickers"`
	WeightedPrice float64                                                  `json:"weightedPrice"`
}

type ExchangeResponseDatabase[T map[string]ExchangeFetchResponseForPair | ExchangeFetchResponseForPair] struct {
	Exchange  string `json:"exchange" bson:"exchange"`
	Data      T      `json:"data" bson:"data"`
	FetchedAt int64  `json:"fetchedAt" bson:"fetched_at"`
}

type ExchangeFetchResponseForPair struct {
	Price  float64 `json:"price,omitempty" bson:"price"`
	Volume float64 `json:"volume,omitempty" bson:"volume"`
}

type ExchangeConfig struct {
	Name         string
	Endpoint     string
	Timeout      string
	Token        string
	PairsToFetch []string
}

type Exchange interface {
	Fetch(pair string) (ExchangeFetchResponseForPair, error)
	GetName() string
}
