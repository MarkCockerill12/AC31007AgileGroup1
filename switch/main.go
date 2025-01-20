package main

import (
	"fmt"
	"net"
	"os"
)

// handleConnection handles incoming connections.
func handleConnection(conn net.Conn) {
	defer conn.Close() // Ensure the connection is closed when the function exits

	fmt.Printf("New connection established: %s\n", conn.RemoteAddr().String())

	// Example: Echo back data received from the client
	buffer := make([]byte, 1024)
	for {
		bytesRead, err := conn.Read(buffer)
		if err != nil {
			fmt.Printf("Connection closed by %s\n", conn.RemoteAddr().String())
			return
		}
		fmt.Printf("Received: %s", string(buffer[:bytesRead]))

		_, err = conn.Write(buffer[:bytesRead])
		if err != nil {
			fmt.Printf("Error writing to connection: %s\n", err)
			return
		}
	}
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
