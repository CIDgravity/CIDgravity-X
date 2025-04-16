package api

import (
	"net/http"
	"runtime/debug"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/requestid"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/CIDgravity/Ticker/config"
	"github.com/CIDgravity/Ticker/controller"
	logs "github.com/CIDgravity/Ticker/pkg/logger"

	"github.com/CIDgravity/Ticker/repository"
	"github.com/CIDgravity/Ticker/service"

	"github.com/go-co-op/gocron"
)

func Setup(config config.Config, dB *mongo.Database) *http.Server {
	logs.Info(logs.LogParams{
		Message: "Setup all REST API endpoints ...",
	})

	// Init needed repository, service and controller (important order)
	exchangeRepository := repository.NewExchangeRepository(dB, config)
	exchangeService := service.NewExchangeService(exchangeRepository, config)
	exchangeController := controller.NewExchangeController(dB, exchangeService)
	appController := controller.NewAppController(dB)

	// Define all the API endpoints
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()

	// Init cron task to fetch exchanges
	// We use the SingletonMode() to prevent new task if previous not finished
	cronManager := gocron.NewScheduler(time.Local)

	// Launch tasks that will retrieve base fee and Messari data using websocket
	_, err := cronManager.Every(config.Exchange.FetchPeriod).SingletonMode().Do(exchangeService.FetchExchanges)

	if err != nil {
		logs.Panic(logs.LogParams{
			Message:    "Error while starting cron job to fetch exchanges data",
			Error:      err,
			Stacktrace: debug.Stack(),
		})
	}

	cronManager.StartAsync()

	// Generate a unique request id, we will use this identifier for loggers and return errors code
	router.Use(
		requestid.New(
			requestid.WithGenerator(func() string {
				return uuid.New().String()
			}),
		),
	)

	server := &http.Server{
		Addr:    ":" + config.API.ListenPort,
		Handler: router,
	}

	// Generate a unique request id, we will use this identifier for loggers and return errors code
	router.Use(
		requestid.New(
			requestid.WithGenerator(func() string {
				return uuid.New().String()
			}),
		),
	)

	// Define gin main configuration and CORS policies
	router.Use(
		cors.New(cors.Config{
			AllowOrigins:     []string{"*"},
			AllowMethods:     []string{"POST, GET, OPTIONS, PUT, DELETE, PATCH"},
			AllowHeaders:     []string{"Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Host, Authorization, accept, Origin, Cache-Control, X-Requested-With"},
			AllowCredentials: true,
			MaxAge:           12 * time.Hour,
		}),
	)

	// Configure logger format for GIN
	router.Use(logs.CustomGinLogger())

	// Setup all API route
	apiV1 := router.Group("/v1")
	{
		apiV1.GET("/get-version", appController.GetVersion)
		apiV1.GET("/ping", appController.Ping)

		apiV1.GET("/get-latest-tickers", exchangeController.GetLatestTickers)
		apiV1.GET("/get-latest-tickers/:pairToFetch", exchangeController.GetLatestTickersForPair)
	}

	return server
}
