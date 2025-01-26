package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"net"
	"os"

	creditcard "github.com/durango/go-credit-card"
)

type Request struct {
	TnxID      string  `json:"TnxID"`
	TnxTime    string  `json:"TnxTime"`
	TnxKind    int     `json:"TnxKind"`
	TnxAmount  float64 `json:"TnxAmount"`
	CardNumber int     `json:"CardNumber"`
	PIN        int     `json:"PIN"`
}

type Response struct {
	TnxID        string `json:"TnxID"`
	ResponseType int    `json:"RespType"`
	Message      string `json:"msg"`
}

var networksAddresses = map[string]string{
	"visa":       "54.164.156.45:31007",
	"mastercard": "54.164.156.45:31007",
}

var (
	transactionLogger = InitLogger("transaction-logs", "transaction-log")
	requestLogger     = InitLogger("request-logs", "request-log")
	errorLogger       = InitLogger("error-logs", "error-log")
)

func handleConnection(conn net.Conn) {
	defer conn.Close() // Ensure the connection is closed when the function exits

	fmt.Printf("INFO: New connection established - %s\n", conn.RemoteAddr().String())

	buffer := make([]byte, 1024)
	for {
		bytesRead, err := conn.Read(buffer)
		if err != nil {
			fmt.Printf("Connection closed by %s\n", conn.RemoteAddr().String())
			error := fmt.Errorf("ERROR: client(address: %s) closed connection: %w", conn.RemoteAddr().String(), err)
			errorLogger.Channel <- error.Error()
			return
		}

		request := buffer[:bytesRead]
		fmt.Printf("Received request: %s\n", string(request)) // Added line
		response, err := forwardRequest(request)

		requestLogger.Channel <- fmt.Sprintf("Request: %s", request)
		if err != nil {
			fmt.Printf("Error processing request: %s\n", err)
			error := fmt.Errorf("ERROR: failed to process request form client (address: %s): %w", conn.RemoteAddr().String(), err)
			errorLogger.Channel <- error.Error()
			conn.Write([]byte(fmt.Sprintf("Error: %s", err)))
			continue
		}

		_, err = conn.Write(response)
		if err != nil {
			error := fmt.Errorf("ERROR: failed to write response to client (address: %s): %w", conn.RemoteAddr().String(), err)
			fmt.Println(error)
			errorLogger.Channel <- error.Error()
			return
		}
	}
}

func parseCardInfo(request []byte) (Request, error) {
	var req Request
	err := json.Unmarshal(request, &req)
	return req, err
}

func parseResponse(response []byte) (Response, error) {
	var res Response
	err := json.Unmarshal(response, &res)
	return res, err
}

func getCardIssuer(cardNumber int) (creditcard.Company, error) {
	card := creditcard.Card{
		Number:  fmt.Sprint(cardNumber),
		Cvv:     "",
		Month:   "",
		Year:    "",
		Company: creditcard.Company{},
	}
	err := card.Method()
	if err != nil {
		return creditcard.Company{}, err
	}

	return card.Company, nil
}

func forwardRequest(request []byte) ([]byte, error) {
	req, err := parseCardInfo(request)
	if err != nil {
		return nil, fmt.Errorf("failed to parse request: %w", err)
	}

	company, err := getCardIssuer(req.CardNumber)
	if err != nil {
		return nil, fmt.Errorf("failed to get card issuer: %w", err)
	}

	companyAddress, exists := networksAddresses[company.Short]
	if !exists {
		return nil, fmt.Errorf("unknown card issuer: %s", company.Short)
	}

	response, err := SendTCPMessage(companyAddress, request)
	if err != nil {
		return nil, fmt.Errorf("failed to forward request: %w", err)
	}

	transactionLogger.Channel <- fmt.Sprintf("Transaction: %s", response)

	return []byte(response), nil
}

func SendTCPMessage(serverAddr string, message []byte) (string, error) {
	// Establish a TCP connection
	conn, err := net.Dial("tcp", serverAddr)
	if err != nil {
		return "", fmt.Errorf("failed to connect to server: %w", err)
	}
	defer conn.Close()

	// Send the message over the connection
	_, err = conn.Write(message)
	if err != nil {
		return "", fmt.Errorf("failed to send message: %w", err)
	}

	// Wait for a response from the server
	reader := bufio.NewReader(conn)
	response, err := reader.ReadString('\n') // Assumes newline-terminated responses
	if err != nil {
		return "", fmt.Errorf("failed to read response: %w", err)
	}

	return response, nil
}

func main() {
	// Define the address and port to listen on
	address := "0.0.0.0:8080"
	listener, err := net.Listen("tcp", address)
	if err != nil {
		error := fmt.Errorf("ERROR: failed to start server: %w", err)
		fmt.Println(error)
		errorLogger.Channel <- error.Error()
		os.Exit(1)
	}
	defer listener.Close()

	requestLogger.StartLogger()
	defer requestLogger.StopLogger()

	transactionLogger.StartLogger()
	defer transactionLogger.StopLogger()

	errorLogger.StartLogger()
	defer errorLogger.StopLogger()

	fmt.Printf("INFO: Server listening on %s\n", address)

	for {
		// Wait for a connection
		conn, err := listener.Accept()
		if err != nil {
			error := fmt.Errorf("ERROR: failed to accept connection: %w", err)
			fmt.Println(error)
			errorLogger.Channel <- error.Error()
			continue
		}

		// Handle the connection in a new goroutine
		go handleConnection(conn)
	}
}
