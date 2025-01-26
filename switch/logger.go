package main

import (
	"fmt"
	"os"
	"time"
)

type Logger struct {
	LogDir  string
	LogFile string
	Channel chan string
	logFile *os.File
}

func InitLogger(logDir, logFile string) *Logger {
	logger := &Logger{
		LogDir:  logDir,
		LogFile: logFile,
		Channel: make(chan string, 100),
	}

	// Set default values
	if logger.LogDir == "" {
		logger.LogDir = "logs"
	}
	if logger.LogFile == "" {
		logger.LogFile = "log"
	}

	// Create log directory if it doesn't exist
	if _, err := os.Stat(logger.LogDir); os.IsNotExist(err) {
		if err := os.MkdirAll(logger.LogDir, 0755); err != nil {
			fmt.Printf("Error creating log directory: %v\n", err)
			panic(err)
		}
	}

	// Open log file for writing
	filePath := fmt.Sprintf("%s/%s-%s.txt", logger.LogDir, logger.LogFile, time.Now().UTC().Format("20060102-150405"))
	file, err := os.OpenFile(filePath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		fmt.Printf("Error opening log file: %v\n", err)
		panic(err)
	}
	logger.logFile = file

	return logger
}

func (logger *Logger) StartLogger() {
	go func() {
		for {
			log, ok := <-logger.Channel
			if !ok { // Channel closed
				fmt.Println("Logger channel closed, stopping logger.")
				return // Exit the goroutine
			}
			// Write log to file
			_, err := logger.logFile.WriteString(time.Now().UTC().Format(time.RFC3339) + " " + log + "\n")
			if err != nil {
				fmt.Printf("Error writing to log file: %v\n", err)
				panic(err)
			}
		}
	}()
}

func (logger *Logger) StopLogger() {
	close(logger.Channel)  // Close the channel
	logger.logFile.Close() // Close the log file
}
