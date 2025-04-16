package mongo_test

import (
	"os"
	"testing"

	"github.com/CIDgravity/Ticker/pkg/database/mongo"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/event"
)

func TestGenerateMongoShRequestFromCommand(t *testing.T) {
	t.Run("nil event", func(t *testing.T) {
		cmd, typ, err := mongo.GenerateMongoShRequestFromCommand(nil)
		assert.Error(t, err)
		assert.Equal(t, "", cmd)
		assert.Equal(t, "", typ)
	})

	t.Run("aggregate", func(t *testing.T) {
		commandDoc := bson.D{
			{Key: "aggregate", Value: "myCollection"},
			{Key: "pipeline", Value: bson.A{bson.D{{Key: "$match", Value: bson.D{{Key: "field", Value: "value"}}}}}},
		}
		raw, _ := bson.Marshal(commandDoc)

		event := &event.CommandStartedEvent{
			Command:     raw,
			CommandName: "aggregate",
		}

		cmd, typ, err := mongo.GenerateMongoShRequestFromCommand(event)
		assert.NoError(t, err)
		assert.Equal(t, `db.getCollection("myCollection").aggregate([{"$match":{"field":"value"}}])`, cmd)
		assert.Equal(t, "request", typ)
	})

	t.Run("find", func(t *testing.T) {
		commandDoc := bson.D{
			{Key: "find", Value: "bar"},
			{Key: "filter", Value: bson.D{{Key: "name", Value: "Foo"}}},
		}
		raw, _ := bson.Marshal(commandDoc)

		event := &event.CommandStartedEvent{
			Command:     raw,
			CommandName: "find",
		}

		cmd, typ, err := mongo.GenerateMongoShRequestFromCommand(event)
		assert.NoError(t, err)
		assert.Equal(t, `db.getCollection("bar").find({"name":"Foo"})`, cmd)
		assert.Equal(t, "request", typ)
	})

	t.Run("cursor_iteration", func(t *testing.T) {
		commandDoc := bson.D{{Key: "getMore", Value: 12345}}
		raw, _ := bson.Marshal(commandDoc)

		event := &event.CommandStartedEvent{
			Command:     raw,
			CommandName: "getMore",
		}

		cmd, typ, err := mongo.GenerateMongoShRequestFromCommand(event)
		assert.NoError(t, err)
		assert.Equal(t, "", cmd)
		assert.Equal(t, "iteration", typ)
	})
}

func TestConnect(t *testing.T) {
	t.Run("invalid URI", func(t *testing.T) {
		cfg := mongo.Config{
			URI:               "invalid://localhost",
			Database:          "test",
			ConnectionTimeout: "1s",
			SlowThresholdLogs: "1ms",
			MaxConnection:     1,
			MaxPoolSize:       1,
		}

		db, err := mongo.Connect(cfg)
		assert.Error(t, err)
		assert.Nil(t, db)
	})

	t.Run("valid config (if DB available)", func(t *testing.T) {
		if testing.Short() {
			t.Skip("Skipping MongoDB live test in short mode.")
		}

		uri := os.Getenv("MONGO_TEST_URI")
		if uri == "" {
			t.Skip("MONGO_TEST_URI not set")
		}

		cfg := mongo.Config{
			URI:               uri,
			Database:          "test_db",
			ConnectionTimeout: "2s",
			SlowThresholdLogs: "5ms",
			MaxConnection:     5,
			MaxPoolSize:       10,
		}

		db, err := mongo.Connect(cfg)
		assert.NoError(t, err)
		assert.Equal(t, "test_db", db.Name())
	})
}
