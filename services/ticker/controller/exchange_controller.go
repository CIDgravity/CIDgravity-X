package controller

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"runtime/debug"

	"github.com/CIDgravity/Ticker/config"
	"github.com/CIDgravity/Ticker/internal/exchange"
	logs "github.com/CIDgravity/Ticker/pkg/logger"
	"github.com/CIDgravity/Ticker/service"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/gin-gonic/gin"
)

type ExchangeController interface {
	GetLatestTickers(c *gin.Context)
	GetLatestTickersForPair(c *gin.Context)
}

type exchangeController struct {
	dB              *mongo.Database
	exchangeService service.ExchangeService
}

func NewExchangeController(dB *mongo.Database, exchangeService service.ExchangeService) ExchangeController {
	return exchangeController{
		dB:              dB,
		exchangeService: exchangeService,
	}
}

func (ctrl exchangeController) GetLatestTickers(c *gin.Context) {
	results, err := ctrl.exchangeService.GetLatestTickers()

	if err != nil {
		logs.Error(logs.LogParams{
			Message:    "Error while executing GetLatestTickers",
			Error:      err,
			Stacktrace: debug.Stack(),
		})

		c.JSON(http.StatusBadRequest, gin.H{"error": "something wrong"})
		return
	}

	c.JSON(http.StatusOK, results)
}

func (ctrl exchangeController) GetLatestTickersForPair(c *gin.Context) {
	if c.Request.Body == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	var pairToFetch exchange.FetchRequestBody
	bodyBytes, err := io.ReadAll(c.Request.Body)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))
	if err := json.Unmarshal(bodyBytes, &pairToFetch); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	if pairToFetch.Pair == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "pair is mandatory"})
		return
	}

	// Find the pair in config for a sample exchange
	// If not found it means pair not supported, so can't be fetched (or data will be empty)
	_, err = config.GetPairForPlatform("Kraken", pairToFetch.Pair)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "pair not supported. Only FIL_USD is supported at this time"})
		return
	}

	// Fetch data
	results, err := ctrl.exchangeService.GetLatestTickersForPair(pairToFetch.Pair)

	if err != nil {
		logs.Error(logs.LogParams{
			Message:    "Error while executing GetLatestTickersForPair",
			Error:      err,
			Stacktrace: debug.Stack(),
		})

		c.JSON(http.StatusBadRequest, gin.H{"error": "something wrong"})
		return
	}

	c.JSON(http.StatusOK, results)
}
