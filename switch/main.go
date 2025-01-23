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

func handleConnection(conn net.Conn) {
	defer conn.Close() // Ensure the connection is closed when the function exits

	fmt.Printf("New connection established: %s\n", conn.RemoteAddr().String())

	buffer := make([]byte, 1024)
	for {
		bytesRead, err := conn.Read(buffer)
		if err != nil {
			fmt.Printf("Connection closed by %s\n", conn.RemoteAddr().String())
			return
		}

		request := buffer[:bytesRead]
		fmt.Printf("Received request: %s\n", string(request)) // Added line
		response, err := forwardRequest(request)

		if err != nil {
			fmt.Printf("Error processing request: %s\n", err)
			conn.Write([]byte(fmt.Sprintf("Error: %s", err)))
			continue
		}

		_, err = conn.Write(response)
		if err != nil {
			fmt.Printf("Error writing to connection: %s\n", err)
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
	address := "localhost:8080"
	listener, err := net.Listen("tcp", address)
	if err != nil {
		fmt.Printf("Error starting server: %s\n", err)
		os.Exit(1)
	}
	defer listener.Close()

	fmt.Printf("Server listening on %s\n", address)

	for {
		// Wait for a connection
		conn, err := listener.Accept()
		if err != nil {
			fmt.Printf("Error accepting connection: %s\n", err)
			continue
		}

		// Handle the connection in a new goroutine
		go handleConnection(conn)
	}
}
