package logger_test

import (
	"errors"
	"testing"

	"github.com/CIDgravity/Ticker/pkg/logger"
	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"

	gormLogger "gorm.io/gorm/logger"
)

func TestStringToLogrusLogType(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		tests := []struct {
			logLevel string
			expected logrus.Level
		}{
			{"error", logrus.ErrorLevel},
			{"warn", logrus.WarnLevel},
			{"info", logrus.InfoLevel},
			{"debug", logrus.DebugLevel},
			{"unknown", logrus.ErrorLevel}, // default case
		}

		for _, tt := range tests {
			t.Run(tt.logLevel, func(t *testing.T) {
				result := logger.StringToLogrusLogType(tt.logLevel)
				assert.Equal(t, tt.expected, result)
			})
		}
	})
}

func TestInitLogger(t *testing.T) {
	t.Run("invalid_log_level", func(t *testing.T) {
		log := logger.InitLogger("invalid", false)
		assert.NotNil(t, log)
		assert.Equal(t, logrus.ErrorLevel, log.Level)
	})

	t.Run("success", func(t *testing.T) {
		log := logger.InitLogger("info", false)
		assert.NotNil(t, log)
		assert.Equal(t, logrus.InfoLevel, log.Level)
	})
}

func TestLog(t *testing.T) {
	t.Run("info_level", func(t *testing.T) {
		logger.InitLogger("info", false)

		logger.Info(logger.LogParams{
			Message: "This is an info message",
			Params:  map[string]interface{}{"key": "value"},
		})

		assert.NotPanics(t, func() {
			logger.Info(logger.LogParams{
				Message: "Info message with parameters",
				Params:  map[string]interface{}{"key": "value"},
			})
		})
	})

	t.Run("error_level", func(t *testing.T) {
		logger.InitLogger("error", false)
		err := errors.New("test error")

		assert.NotPanics(t, func() {
			logger.Error(logger.LogParams{
				Message: "This is an error message",
				Error:   err,
			})
		})
	})
}

func TestNewGormLog(t *testing.T) {
	t.Run("invalid_level", func(t *testing.T) {
		gormLog := logger.NewGormLog("invalid", "1s")
		assert.NotNil(t, gormLog)
	})

	t.Run("success", func(t *testing.T) {
		gormLog := logger.NewGormLog("info", "1s")
		assert.NotNil(t, gormLog)
	})
}

func TestStringToGormLogType(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		tests := []struct {
			logLevel string
			expected gormLogger.LogLevel
		}{
			{"error", gormLogger.Error},
			{"warn", gormLogger.Warn},
			{"info", gormLogger.Info},
			{"debug", gormLogger.Info},    // defaults to Info
			{"unknown", gormLogger.Error}, // default case
		}

		for _, tt := range tests {
			t.Run(tt.logLevel, func(t *testing.T) {
				result := logger.StringToGormLogType(tt.logLevel)
				assert.Equal(t, tt.expected, result)
			})
		}
	})
}
