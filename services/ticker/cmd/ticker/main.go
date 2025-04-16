package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"runtime/debug"
	"syscall"
	"time"

	"github.com/urfave/cli/v2"

	"github.com/CIDgravity/Ticker/api"
	"github.com/CIDgravity/Ticker/config"
	"github.com/CIDgravity/Ticker/pkg/database/mongo"
	logs "github.com/CIDgravity/Ticker/pkg/logger"
)

var version = "dev"

func main() {
	app := &cli.App{
		Name:     "Ticker",
		Version:  version,
		Compiled: time.Now(),
		Authors: []*cli.Author{
			{
				Name:  "CIDgravity",
				Email: "contact@cidgravity.com",
			},
		},
		Usage:     "Fetch data from multiple exchange and store into database",
		UsageText: "cidgravity-ticker [global options] command [command options] [arguments...]",

		// Global options to avoid providing this for all subcommands
		Flags: []cli.Flag{
			&cli.StringFlag{
				Name:  "config",
				Value: "",
				Usage: "config file path (folder only, config.toml will be used as filename)",
			},
		},

		// If no command, run ticker with web server (expose API route to retrieve last record)
		// global options are not considered as param here
		Action: func(cCtx *cli.Context) error {
			if cCtx.NArg() == 0 {
				runTicker(cCtx.String("config"))
				return nil
			} else {
				return fmt.Errorf("command must be one of [watcher, init, walk-between] or empty to launch watcher by default")
			}
		},

		Commands: []*cli.Command{},
	}

	// Launch application
	if err := app.Run(os.Args); err != nil {
		log.Fatal(err)
	}
}

// runTicker will run a cron task to retrieve data from all exchanges and store in database
// long running program
func runTicker(configPath string) {
	if configPath == "" {
		configPath = os.Args[0]
	}

	configDir, err := filepath.Abs(filepath.Dir(configPath))
	if err != nil {
		logs.Panic(logs.LogParams{
			Message:    "Can't find executable path with message with message",
			Error:      err,
			Stacktrace: debug.Stack(),
			Params: map[string]interface{}{
				"configPath": configPath,
			},
		})
	}

	conf, err := config.NewConfigFromFile(configDir, "config.toml")

	if err != nil {
		logs.Panic(logs.LogParams{
			Message:    "Error while loading configuration file",
			Error:      err,
			Stacktrace: debug.Stack(),
			Params: map[string]interface{}{
				"configPath": configPath,
			},
		})
	}

	// Database : init settings and test connexion
	logs.Info(logs.LogParams{
		Message: "Setup connection to Mongo database ...",
	})

	db, err := mongo.Connect(conf.Database)

	if err != nil {
		logs.Panic(logs.LogParams{
			Message:    "Error while connecting to Mongo database",
			Error:      err,
			Stacktrace: debug.Stack(),
			Params: map[string]interface{}{
				"DatabaseURI": conf.Database.URI,
			},
		})
	}

	// Init the logger that will be used in entire app
	logs.InitLogger(conf.Logs.Level, conf.Logs.OutputLogsAsJSON)

	// Setup API servers and Cron jobs
	APIServer := api.Setup(*conf, db)

	// Start the server with the configuration
	go func() {
		logs.Info(logs.LogParams{
			Message: "Server listening on port " + conf.API.ListenPort,
		})

		if err := APIServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logs.Panic(logs.LogParams{
				Message:    "Error while listening API",
				Error:      err,
				Stacktrace: debug.Stack(),
				Params: map[string]interface{}{
					"DatabaseURI": conf.Database.URI,
				},
			})
		}
	}()

	// Wait for interrupt signal to gracefully shut down the server with a timeout of 5 seconds.
	// Context is used to inform the server it has 5 seconds to finish the request it is currently handling
	// kill (no param) default send syscall.SIGTERM
	// kill -2 is syscall.SIGINT
	// kill -9 is syscall.SIGKILL but can't be caught, so don't need to add it
	quit := make(chan os.Signal, 1)

	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	// Do some actions here : close DB connections, ...
	logs.Info(logs.LogParams{Message: "SIGINT, SIGTERM received, will shut down server ..."})

	logs.Info(logs.LogParams{Message: "Closing all database pool ..."})
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	if err := APIServer.Shutdown(ctx); err != nil {
		logs.Error(logs.LogParams{
			Message: "Server forced to shutdown",
			Error:   err,
		})

	} else {
		logs.Info(logs.LogParams{Message: "Application stopped gracefully !"})
	}
}
