package mongo

import (
	ctxLib "context"
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	logs "github.com/CIDgravity/Ticker/pkg/logger"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/event"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Config struct {
	SlowThresholdLogs string `mapstructure:"SlowThresholdLogs"` // Value under which a query is considered slow. "1ms", "1s", etc - anything that's parsable by time.ParseDuration(interval).
	URI               string `mapstructure:"URI" validate:"required"`
	Database          string `mapstructure:"Database" validate:"required"`
	ConnectionTimeout string `mapstructure:"ConnectionTimeout"`
	MaxConnection     uint64 `mapstructure:"MaxConnection"`
	MaxPoolSize       uint64 `mapstructure:"MaxPoolSize"`
	RequestTimeout    string `mapstructure:"RequestTimeout"`
	CollectionName    string `mapstructure:"CollectionName"`
}

func GenerateMongoShRequestFromCommand(event *event.CommandStartedEvent) (string, string, error) {
	if event == nil {
		return "", "", fmt.Errorf("empty event")
	}

	// Parse event as map and json
	command := make(map[string]interface{})
	_ = bson.Unmarshal(event.Command, command)

	// Build the mongosh command format
	// if command["aggregate"] is nil, is means the request is a cursor iteration not a request, so ignore the log
	if command["aggregate"] != nil {
		jsonStr, err := json.Marshal(command["pipeline"])
		if err != nil {
			return "", "", err
		}

		return fmt.Sprintf(
			"db.getCollection(\"%s\").%s(%s)",
			command["aggregate"].(string),
			event.CommandName,
			jsonStr,
		), "request", nil
	}

	if command["find"] != nil {
		jsonStr, err := json.Marshal(command["filter"])
		if err != nil {
			return "", "", err
		}

		return fmt.Sprintf(
			"db.getCollection(\"%s\").%s(%s)",
			command["find"].(string),
			event.CommandName,
			jsonStr,
		), "request", nil
	}

	return "", "iteration", nil
}

func Connect(config Config) (*mongo.Database, error) {
	connectionTimeoutDuration, err := time.ParseDuration(config.ConnectionTimeout)

	if err != nil {
		return nil, err
	}

	ctx, cancel := ctxLib.WithTimeout(ctxLib.Background(), connectionTimeoutDuration)
	defer cancel()

	// Parse the config SlowThresholdLogs param
	slowThreshold, err := time.ParseDuration(config.SlowThresholdLogs)

	if err != nil {
		return nil, err
	}

	// Create a command monitor in order to add logs line related to MongoDB
	mongoCommandMonitor := &event.CommandMonitor{
		Started: func(c ctxLib.Context, e *event.CommandStartedEvent) {

			mongoshCommand, commandType, err := GenerateMongoShRequestFromCommand(e)

			if err != nil {
				logs.Warning(logs.LogParams{
					Message: "Unable to parse Mongosh request from mongo CommandStartedEvent",
					Error:   err,
				})

			} else {
				if commandType == "request" {
					logs.Debug(logs.LogParams{
						Message: "Executed MongoDB query with following mongosh command",
						Params: map[string]interface{}{
							"mongoshCommand": mongoshCommand,
						},
					})
				} else {
					logs.Debug(logs.LogParams{
						Message: "Executed MongoDB next iteration",
					})
				}
			}
		},
		Succeeded: func(c ctxLib.Context, e *event.CommandSucceededEvent) {
			if e.Duration.Nanoseconds() >= slowThreshold.Nanoseconds() {
				logs.Warning(logs.LogParams{
					Message: "MongoDB slow request detected",
					Params: map[string]interface{}{
						"durationInMs": strconv.FormatInt(e.Duration.Nanoseconds()/1000000, 10),
					},
				})
			}
		},
	}

	// Define some connection options
	// We use mongonitor to display all debugs from MongoDB connection
	opts := options.Client().SetMaxConnecting(config.MaxConnection).
		SetMaxPoolSize(config.MaxPoolSize).
		SetMonitor(mongoCommandMonitor)

	client, err := mongo.Connect(ctx, opts.ApplyURI(config.URI))

	if err != nil {
		logs.Error(logs.LogParams{
			Message: "Unable to connect to MongoDB database",
			Error:   err,
		})

		return nil, err
	}

	// Connect to a specific database before returning the MongoDB instance
	return client.Database(config.Database), nil
}
