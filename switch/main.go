package main

import (
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

		msg := string(buffer[:bytesRead])

		fmt.Printf("Received: %s", msg)

		card, err := parseCardInfo(msg)

		issuer, err := getCardIssuer(card.CardNumber)

		_, err = conn.Write([]byte(issuer.Short))
		if err != nil {
			fmt.Printf("Error writing to connection: %s\n", err)
			return
		}
	}
}

func parseCardInfo(request string) (Request, error) {
	var req Request
	err := json.Unmarshal([]byte(request), &req)
	if err != nil {
		return req, err
	}
	return req, nil
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
