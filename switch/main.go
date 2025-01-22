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
		if err != nil {
			fmt.Printf("Error parsing card info: %s\n", err)
			return
		}

		issuer, err := getCardIssuer(card.CardNumber)
		if err != nil {
			fmt.Printf("Error getting card issuer: %s\n", err)
			return
		}

		_, err = conn.Write([]byte(issuer.Short))
		if err != nil {
			fmt.Printf("Error writing to connection: %s\n", err)
			return
		}

		//onwards to the network simulation
		err = forwardRequestToNetworkSimulator(msg, issuer)
		if err != nil {
			fmt.Printf("Error forwarding request to network simulator: %s\n", err)
			return
		}

	}
}

func forwardRequestToNetworkSimulator(request string, issuer creditcard.Company) error {
	var ip string
	switch issuer.Short {
	case "VISA":
		ip = "8001"
	case "MasterCard":
		ip = "8002"
	case "American Express":
		ip = "8003"
	default:
		return fmt.Errorf("invalid card issuer")
	}

	simConn, err := net.Dial("tcp", net.JoinHostPort("localhost", ip)) //Change which port to connect to dependin on the card provider.
	if err != nil {
		return err
	}
	defer simConn.Close()

	_, err = simConn.Write([]byte(request))
	if err != nil {
		return err
	}

	// Read the response from the network simulator
	simBuffer := make([]byte, 1024)
	simBytesRead, err := simConn.Read(simBuffer)
	if err != nil {
		return err
	}
	simResponse := string(simBuffer[:simBytesRead])
	fmt.Printf("Received from network simulator: %s\n", simResponse)
	return nil
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
