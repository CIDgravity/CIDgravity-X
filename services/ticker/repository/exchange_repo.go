package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/CIDgravity/Ticker/config"
	"github.com/CIDgravity/Ticker/internal/exchange"
	"github.com/CIDgravity/Ticker/pkg/json"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	logs "github.com/CIDgravity/Ticker/pkg/logger"
)

type ExchangeRepository interface {
	InsertSingle(data exchange.ExchangeResponseDatabase[map[string]exchange.ExchangeFetchResponseForPair]) error
	FetchLatestTickers() ([]exchange.ExchangeResponseDatabase[map[string]exchange.ExchangeFetchResponseForPair], int, error)
	FetchLatestTickersForSpecificPair(pair string) ([]exchange.ExchangeResponseDatabase[exchange.ExchangeFetchResponseForPair], int, error)
}

type exchangeRepository struct {
	config config.Config
	dB     *mongo.Database
}

func NewExchangeRepository(dB *mongo.Database, cfg config.Config) ExchangeRepository {
	return exchangeRepository{
		config: cfg,
		dB:     dB,
	}
}

// Insert will store single exchange result for single pair
func (r exchangeRepository) InsertSingle(data exchange.ExchangeResponseDatabase[map[string]exchange.ExchangeFetchResponseForPair]) error {
	result, err := r.dB.Collection(r.config.Database.CollectionName).InsertOne(context.Background(), data)

	logs.Debug(logs.LogParams{
		Message: "Mongo: successfully inserted row to mongo collection",
		Params: map[string]any{
			"insertedID": result.InsertedID,
			"data":       json.OneLiner(data),
		},
	})

	return err
}

func (r exchangeRepository) FetchLatestTickers() ([]exchange.ExchangeResponseDatabase[map[string]exchange.ExchangeFetchResponseForPair], int, error) {
	ctx := context.Background()
	results, err := fetchLatestTickersTyped[map[string]exchange.ExchangeFetchResponseForPair](ctx, r.dB.Collection(r.config.Database.CollectionName), "")
	if err != nil {
		return nil, 0, err
	}
	return results, len(results), nil
}

func (r exchangeRepository) FetchLatestTickersForSpecificPair(pair string) ([]exchange.ExchangeResponseDatabase[exchange.ExchangeFetchResponseForPair], int, error) {
	ctx := context.Background()
	results, err := fetchLatestTickersTyped[exchange.ExchangeFetchResponseForPair](ctx, r.dB.Collection(r.config.Database.CollectionName), pair)
	if err != nil {
		return nil, 0, err
	}
	return results, len(results), nil
}

func fetchLatestTickersTyped[T map[string]exchange.ExchangeFetchResponseForPair | exchange.ExchangeFetchResponseForPair](ctx context.Context, collection *mongo.Collection, pair string) ([]exchange.ExchangeResponseDatabase[T], error) {
	unixTimestampTwoMinutesAgo := time.Now().UnixMilli() - 2*60*1000

	matchStage := bson.M{
		"$match": bson.M{
			"fetched_at": bson.M{
				"$gte": unixTimestampTwoMinutesAgo,
			},
		},
	}

	sortStage := bson.M{
		"$sort": bson.M{
			"exchange":   -1,
			"fetched_at": -1,
		},
	}

	dataField := "$data"
	if pair != "" {
		dataField = fmt.Sprintf("$data.%s", pair)
	}

	groupStage := bson.M{
		"$group": bson.M{
			"_id": "$exchange",
			"exchange": bson.M{
				"$first": "$exchange",
			},
			"fetched_at": bson.M{
				"$first": "$fetched_at",
			},
			"data": bson.M{
				"$first": dataField,
			},
		},
	}

	pipeline := []bson.M{matchStage, sortStage, groupStage}

	cursor, err := collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}

	var results []exchange.ExchangeResponseDatabase[T]
	if err := cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	return results, nil
}
