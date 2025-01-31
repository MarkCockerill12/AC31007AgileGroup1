package main

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"net"
	"time"
)

type requestData struct {
	TnxID string `json:"TnxID"`
}

type responseData struct {
	TnxID    string `json:"TnxID"`
	RespType int    `json:"RespType"`
	Msg      string `json:"msg"`
}

func handleConnection(conn net.Conn) {
	defer conn.Close()

	var req requestData
	dec := json.NewDecoder(conn)
	if err := dec.Decode(&req); err != nil {
		fmt.Println("Error reading request:", err)
		return
	}
	fmt.Printf("Received request: %+v\n", req)

	resp := responseData{
		TnxID:    req.TnxID,
		RespType: 0,
		Msg:      "Successful Transaction",
	}

	time.Sleep(100 * time.Millisecond)

	enc := json.NewEncoder(conn)
	if err := enc.Encode(resp); err != nil {
		fmt.Println("Error sending response:", err)
	}
}

func main() {
	cert, err := tls.LoadX509KeyPair("./Certs/server-cert.pem", "./Certs/server-key.pem")
	if err != nil {
		fmt.Println("Error loading certificate:", err)
		return
	}

	config := &tls.Config{Certificates: []tls.Certificate{cert}}

	ln, err := tls.Listen("tcp", "0.0.0.0:31007", config)
	if err != nil {
		fmt.Println("Error listening:", err)
		return
	}
	defer ln.Close()

	fmt.Println("TLS simulator listening on 0.0.0.0:31007")

	for {
		conn, err := ln.Accept()
		if err != nil {
			fmt.Println("Error accepting:", err)
			continue
		}
		go handleConnection(conn)
	}
}
