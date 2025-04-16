package controller

import (
	logs "github.com/CIDgravity/Ticker/pkg/logger"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/gin-gonic/gin"
)

var version = "dev"

type AppController interface {
	GetVersion(c *gin.Context)
	Ping(c *gin.Context)
}

type appController struct {
	dB *mongo.Database
}

func NewAppController(dB *mongo.Database) AppController {
	return appController{
		dB: dB,
	}
}

func (ctrl appController) GetVersion(c *gin.Context) {
	logs.Info(logs.LogParams{
		Context: c,
		Message: "REST request to get version",
	})

	c.JSON(200, gin.H{"version": version})
}

func (ctrl appController) Ping(c *gin.Context) {
	err := ctrl.dB.Client().Ping(c, nil)

	if err != nil {
		c.JSON(200, gin.H{"message": "Database error"})
		return
	}

	c.JSON(200, gin.H{"message": "All good"})
}
