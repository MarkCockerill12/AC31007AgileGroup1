package main

import (
	"bufio"
	"crypto/tls"
	"crypto/x509"
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

var networksAddresses map[string]string

var (
	transactionLogger = InitLogger("transaction-logs", "transaction-log", ResponseToString)
	requestLogger     = InitLogger("request-logs", "request-log", RequestToString)
	errorLogger       = InitLogger("error-logs", "error-log", func(err error) string { return err.Error() })
)

func init() {
	if os.Getenv("TEST") == "true" {
		return
	}

	addressesJSON, ok := os.LookupEnv("NETWORKS_ADDRESSES")
	if !ok {
		err := fmt.Errorf("ERROR: NETWORKS_ADDRESSES environment variable not set")
		errorLogger.Channel <- err
		os.Exit(1)
	}

	err := json.Unmarshal([]byte(addressesJSON), &networksAddresses)
	if err != nil {
		error := fmt.Errorf("ERROR: failed to parse NETWORKS_ADDRESSES: %w", err)
		errorLogger.Channel <- error
		os.Exit(1)
	}
}

func handleConnection(conn net.Conn) {
	defer conn.Close() // Ensure the connection is closed when the function exits

	fmt.Printf("INFO: New connection established - %s\n", conn.RemoteAddr().String())

	buffer := make([]byte, 1024)
	for {
		bytesRead, err := conn.Read(buffer)
		if err != nil {
			fmt.Printf("Connection closed by %s\n", conn.RemoteAddr().String())
			error := fmt.Errorf("ERROR: client(address: %s) closed connection: %w", conn.RemoteAddr().String(), err)
			errorLogger.Channel <- error
			return
		}

		request := buffer[:bytesRead]
		fmt.Printf("Received request: %s\n", string(request)) // Added line
		response, err := forwardRequest(request)
		if err != nil {
			fmt.Printf("Error processing request: %s\n", err)
			error := fmt.Errorf("ERROR: failed to process request form client (address: %s): %w", conn.RemoteAddr().String(), err)
			errorLogger.Channel <- error
			fmt.Fprintf(conn, "Error: %s", err)
			continue
		}

		_, err = conn.Write(response)
		if err != nil {
			error := fmt.Errorf("ERROR: failed to write response to client (address: %s): %w", conn.RemoteAddr().String(), err)
			fmt.Println(error)
			errorLogger.Channel <- error
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

	requestLogger.Channel <- req

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

	res, err := parseResponse([]byte(response))
	if err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	transactionLogger.Channel <- res

	return []byte(response), nil
}

func SendTCPMessage(serverAddr string, message []byte) (string, error) {
	// Establish a TLS/TCP connection

	certFile, err := os.ReadFile("simulation-cert.pem") // change to be the correct certificate for the simulation
	if err != nil {
		return "", fmt.Errorf("failed to read server certificate: %w", err)
	}
	certPool := x509.NewCertPool()
	if ok := certPool.AppendCertsFromPEM(certFile); !ok {
		return "", fmt.Errorf("unable to parse server certificate")
	}

	conf := &tls.Config{
		RootCAs: certPool,
	}

	conn, err := tls.Dial("tcp", serverAddr, conf)
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

	fmt.Println("TEST", os.Getenv("TEST"))
	if os.Getenv("TEST") == "true" {
		fmt.Println("INFO: Running in test mode")
		return
	}

	port, ok := os.LookupEnv("SWITCH_PORT")
	if !ok {
		err := fmt.Errorf("ERROR: SWITCH_PORT environment variable not set")
		errorLogger.Channel <- err
		os.Exit(1)
	}
	address := fmt.Sprintf("0.0.0.0:%s", port)
	cer, err := tls.LoadX509KeyPair("Certs/server-cert.pem", "Certs/server-key.pem") // server.crt and server.key are the certificate files. These must contain PEM encoded data.
	if err != nil {
		error := fmt.Errorf("ERROR: failed to load certificates: %w", err)
		fmt.Println(error)
		errorLogger.Channel <- error
		os.Exit(1)
	}

	config := &tls.Config{Certificates: []tls.Certificate{cer}} //
	listener, err := tls.Listen("tcp", address, config)
	if err != nil {
		error := fmt.Errorf("ERROR: failed to start server: %w", err)
		fmt.Println(error)
		errorLogger.Channel <- error
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
			errorLogger.Channel <- error
			continue
		}

		// Handle the connection in a new goroutine
		go handleConnection(conn)
	}
}
