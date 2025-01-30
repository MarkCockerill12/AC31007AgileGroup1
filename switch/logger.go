package main

import (
	"fmt"
	"os"
	"time"
)

const logsDirectory = "logs"

type Logger[T any] struct {
	logDirName  string
	logFileName string
	Channel     chan T
	logFile     *os.File
	stringify   func(T) string
}

func InitLogger[T any](dirName, fileName string, stringifyFunc func(T) string) *Logger[T] {
	logger := &Logger[T]{
		logDirName:  dirName,
		logFileName: fileName,
		Channel:     make(chan T, 100),
		stringify:   stringifyFunc,
	}

	// Set default values
	if logger.logDirName == "" {
		logger.logDirName = "logs"
	}
	if logger.logFileName == "" {
		logger.logFileName = "log"
	}

	// Create log directory if it doesn't exist
	if _, err := os.Stat(fmt.Sprintf("%s/%s", logsDirectory, logger.logDirName)); os.IsNotExist(err) {
		if err := os.MkdirAll(fmt.Sprintf("%s/%s", logsDirectory, logger.logDirName), 0755); err != nil {
			fmt.Printf("Error creating log directory: %v\n", err)
			panic(err)
		}
	}

	// Open log file for writing
	filePath := fmt.Sprintf("%s/%s/%s-%s.txt", logsDirectory, logger.logDirName, logger.logFileName, time.Now().UTC().Format("20060102-150405"))
	file, err := os.OpenFile(filePath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		fmt.Printf("Error opening log file: %v\n", err)
		panic(err)
	}
	logger.logFile = file

	fmt.Printf("INFO: Logger initialized with file: %s\n", filePath)

	return logger
}

func (logger *Logger[T]) StartLogger() {
	go func() {
		for {
			loggedVal, ok := <-logger.Channel
			if !ok { // Channel closed
				fmt.Println("Logger channel closed, stopping logger.")
				return // Exit the goroutine
			}

			if logger.stringify == nil {
				err := fmt.Errorf("ERROR: No stringify function provided for logger")
				panic(err)
			}

			record := time.Now().UTC().Format(time.RFC3339) + "\n" + logger.stringify(loggedVal) + "\n"

			fmt.Println(record)

			// Write log to file
			_, err := logger.logFile.WriteString(record)
			if err != nil {
				fmt.Printf("Error writing to log file: %v\n", err)
				panic(err)
			}
		}
	}()
}

func (logger *Logger[T]) StopLogger() {
	close(logger.Channel)  // Close the channel
	logger.logFile.Close() // Close the log file
}

func RequestToString(req Request) string {
	return fmt.Sprintf("TnxID: %s\nTnxTime: %s\nTnxKind: %d\nTnxAmount: %f\nCardNumber: %d\nPIN: %d", req.TnxID, req.TnxTime, req.TnxKind, req.TnxAmount, req.CardNumber, req.PIN)
}

//type Request struct {
//	TnxID      string  `json:"TnxID"`
//	TnxTime    string  `json:"TnxTime"`
//	TnxKind    int     `json:"TnxKind"`
//	TnxAmount  float64 `json:"TnxAmount"`
//	CardNumber int     `json:"CardNumber"`
//	PIN        int     `json:"PIN"`
//}

func ResponseToString(res Response) string {
	return fmt.Sprintf("TnxID: %s\nResponseType: %d\nMessage: %s", res.TnxID, res.ResponseType, res.Message)
}

//type Response struct {
//	TnxID        string `json:"TnxID"`
//	ResponseType int    `json:"RespType"`
//	Message      string `json:"msg"`
//}
