package controller

import (
	"net/http"
	"runtime/debug"

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
	pairToFetch := c.Param("pairToFetch")

	// Check param isn't empty
	if pairToFetch == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing pairToFetch param"})
		return
	}

	results, err := ctrl.exchangeService.GetLatestTickersForPair(pairToFetch)

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
