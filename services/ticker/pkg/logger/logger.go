package logger

import (
	"os"
	"strings"
	"time"

	gormv2logrus "github.com/CIDgravity/gormv2-logrus-fork"
	"github.com/gin-contrib/requestid"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	gormLogger "gorm.io/gorm/logger"
)

type LogLevel string

type LogParams struct {
	Message    string       `json:"message"`
	Context    *gin.Context `json:"context"`
	Params     interface{}  `json:"params"`
	Error      error        `json:"error"`
	Stacktrace []byte       `json:"traceback"`
}

type StackFormatter struct {
	logrus.TextFormatter
}

func StringToLogrusLogType(logLevel string) logrus.Level {
	logLevelLowerCase := strings.ToLower(logLevel)
	switch logLevelLowerCase {
	case "error":
		return logrus.ErrorLevel
	case "warn":
		return logrus.WarnLevel
	case "info":
		return logrus.InfoLevel
	case "debug":
		return logrus.DebugLevel
	default:
		return logrus.ErrorLevel
	}
}

func (f *StackFormatter) Format(entry *logrus.Entry) ([]byte, error) {
	stack, ok := entry.Data["traceback"]
	if ok {
		delete(entry.Data, "traceback")
	}
	res, err := f.TextFormatter.Format(entry)
	if stack, ok := stack.(string); ok && stack != "" {
		res = append(res, []byte("\n"+stack)...)
	}
	return res, err
}

var logger = logrus.New()

func InitLogger(level string, outputAsJSON bool) *logrus.Logger {

	if outputAsJSON {
		logger.SetFormatter(&logrus.JSONFormatter{
			FieldMap: logrus.FieldMap{
				logrus.FieldKeyTime:  "timestamp",
				logrus.FieldKeyLevel: "level",
				logrus.FieldKeyMsg:   "message",
				logrus.FieldKeyFunc:  "caller",
			},
		})
	}

	// Define logLevel
	logType := StringToLogrusLogType(level)
	logger.SetLevel(logType)
	return logger
}

func GetLogger() *logrus.Logger {
	return logger
}

func CustomGinLogger() gin.HandlerFunc {

	return func(c *gin.Context) {

		// Get latency time for the request to return a result
		startTime := time.Now()
		c.Next()
		endTime := time.Now()

		// Use the existing logger instance (level and formatter already defined)
		logger.WithFields(logrus.Fields{
			"method":                c.Request.Method,
			"duration_microseconds": endTime.Sub(startTime).Microseconds(),
			"endpoint":              c.Request.RequestURI,
			"statusCode":            c.Writer.Status(),
			"requestId":             requestid.Get(c),
			"component":             "gin",
		}).Info("GIN Request on API with parameters")
	}
}

func Log(message string, level string, ctx *gin.Context, err error, stacktrace []byte, param interface{}) {

	// Create logrus field to handle parameters only
	logrusFields := logrus.Fields{}

	// If stacktrace and context not null, print the full stacktrace and add the request uuid
	if len(stacktrace) > 0 && ctx != nil {
		logrusFields["err"] = err
		logrusFields["uuid"] = requestid.Get(ctx)
		logrusFields["traceback"] = string(stacktrace)
	}

	// If there is a stack trace, and no context, print only the stacktrace without request ID
	if len(stacktrace) > 0 && ctx == nil {
		logrusFields["err"] = err
		logrusFields["traceback"] = string(stacktrace)
	}

	// If there is no stacktrace but a context, add only the request ID field
	if len(stacktrace) <= 0 && ctx != nil {
		logrusFields["err"] = err
		logrusFields["uuid"] = requestid.Get(ctx)
	}

	// If there is params, add to fields
	if err != nil && param != nil {
		logrusFields["err"] = err
		logrusFields["params"] = param
	}

	// If there is params, add to fields
	if err == nil && param != nil {
		logrusFields["params"] = param
	}

	// Print the message
	switch strings.ToLower(level) {
	case "panic":
		logger.WithFields(logrusFields).Errorln(message)
		os.Exit(1)

	case "fatal":
		logger.WithFields(logrusFields).Fatalln(message)

	case "error":
		logger.WithFields(logrusFields).Errorln(message)

	case "warning":
		logger.WithFields(logrusFields).Warningln(message)

	case "info":
		logger.WithFields(logrusFields).Infoln(message)

	case "debug":
		logger.WithFields(logrusFields).Debug(message)

	case "trace":
		logger.WithFields(logrusFields).Traceln(message)
	}
}

func Panic(params LogParams) {
	Log(params.Message, "panic", params.Context, params.Error, params.Stacktrace, params.Params)
}

func Fatal(params LogParams) {
	Log(params.Message, "fatal", params.Context, params.Error, params.Stacktrace, params.Params)
}

func Error(params LogParams) {
	Log(params.Message, "error", params.Context, params.Error, params.Stacktrace, params.Params)
}

func Warning(params LogParams) {
	Log(params.Message, "warning", params.Context, params.Error, nil, params.Params)
}

func Info(params LogParams) {
	Log(params.Message, "info", params.Context, nil, nil, params.Params)
}

func Debug(params LogParams) {
	Log(params.Message, "debug", params.Context, nil, nil, params.Params)
}

func Trace(params LogParams) {
	Log(params.Message, "trace", params.Context, nil, params.Stacktrace, params.Params)
}

func stringToGormLogType(logLevel string) gormLogger.LogLevel {
	logLevelLowerCase := strings.ToLower(logLevel)
	switch logLevelLowerCase {
	case "error":
		return gormLogger.Error
	case "warn":
		return gormLogger.Warn
	case "info":
		return gormLogger.Info
	case "debug":
		return gormLogger.Info
	default:
		return gormLogger.Error
	}
}

func NewGormLog(level string, databaseSlowThreshold string) *gormv2logrus.Gormlog {
	slowThresholdDuration, _ := time.ParseDuration(databaseSlowThreshold)

	// Create custom logger
	gormLog := gormv2logrus.NewGormlog(
		gormv2logrus.WithGormOptions(
			gormv2logrus.GormOptions{
				LogLevel:      stringToGormLogType(level),
				SlowThreshold: slowThresholdDuration,
				LogLatency:    true,
			},
		),
	)
	return gormLog
}

func StringToGormLogType(logLevel string) gormLogger.LogLevel {
	logLevelLowerCase := strings.ToLower(logLevel)
	switch logLevelLowerCase {
	case "error":
		return gormLogger.Error
	case "warn":
		return gormLogger.Warn
	case "info":
		return gormLogger.Info
	case "debug":
		return gormLogger.Info
	default:
		return gormLogger.Error
	}
}
