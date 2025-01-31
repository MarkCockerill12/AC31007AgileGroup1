package main

import (
	"bufio"
	"context"
	"crypto/tls"
	"crypto/x509"
	"encoding/json"
	"flag"
	"fmt"
	"math"
	"os"
	"sync"
	"sync/atomic"
	"time"

	"github.com/google/uuid"
)

type SwitchStressTest struct {
	switchHost       string
	switchPort       int
	concurrentUsers  int
	testDuration     time.Duration
	successful       int64
	failed           int64
	responseTimes    []float64
	responseTimesMtx sync.Mutex
	startTime        time.Time
}

type transaction struct {
	TnxID      string  `json:"TnxID"`
	TnxTime    string  `json:"TnxTime"`
	TnxKind    int     `json:"TnxKind"`
	TnxAmount  float64 `json:"TnxAmount"`
	CardNumber int64   `json:"CardNumber"`
	PIN        int     `json:"PIN"`
}

func (s *SwitchStressTest) generateTransaction() transaction {
	return transaction{
		TnxID:      uuid.New().String(),
		TnxTime:    time.Now().UTC().Format(time.RFC3339),
		TnxKind:    1,
		TnxAmount:  100.00,
		CardNumber: 4532772818527395,
		PIN:        1234,
	}
}

func (s *SwitchStressTest) singleClient(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			return
		default:
		}

		if time.Since(s.startTime) > s.testDuration {
			return
		}

		certPool := x509.NewCertPool()
		pemBytes, err := os.ReadFile("./Certs/server-cert.pem")
		if err != nil {
			atomic.AddInt64(&s.failed, 1)
			time.Sleep(time.Second)
			continue
		}
		certPool.AppendCertsFromPEM(pemBytes)

		tlsConfig := &tls.Config{
			RootCAs:            certPool,
			InsecureSkipVerify: true,
		}

		start := time.Now()
		conn, err := tls.Dial("tcp", fmt.Sprintf("%s:%d", s.switchHost, s.switchPort), tlsConfig)
		if err != nil {
			atomic.AddInt64(&s.failed, 1)
			time.Sleep(time.Second)
			continue
		}

		tx := s.generateTransaction()
		data, _ := json.Marshal(tx)
		data = append(data, '\n')

		_, _ = conn.Write(data)

		scanner := bufio.NewReader(conn)
		_, err = scanner.ReadBytes('\n')
		elapsed := float64(time.Since(start).Milliseconds())

		if err != nil {
			atomic.AddInt64(&s.failed, 1)
			conn.Close()
			time.Sleep(1 * time.Second)
			continue
		}

		s.responseTimesMtx.Lock()
		s.responseTimes = append(s.responseTimes, elapsed)
		s.responseTimesMtx.Unlock()

		atomic.AddInt64(&s.successful, 1)
		_ = conn.Close()
		time.Sleep(100 * time.Millisecond)
	}
}

func (s *SwitchStressTest) printStatistics() {
	total := atomic.LoadInt64(&s.successful) + atomic.LoadInt64(&s.failed)
	fmt.Println("\n=== Test Results ===")
	fmt.Printf("Total Requests: %d\n", total)
	fmt.Printf("Successful Requests: %d\n", atomic.LoadInt64(&s.successful))
	fmt.Printf("Failed Requests: %d\n", atomic.LoadInt64(&s.failed))

	s.responseTimesMtx.Lock()
	defer s.responseTimesMtx.Unlock()
	if len(s.responseTimes) == 0 {
		fmt.Println("No successful requests to calculate statistics")
		return
	}

	sum := 0.0
	minVal := math.MaxFloat64
	maxVal := 0.0
	for _, r := range s.responseTimes {
		sum += r
		if r < minVal {
			minVal = r
		}
		if r > maxVal {
			maxVal = r
		}
	}
	avg := sum / float64(len(s.responseTimes))
	fmt.Printf("Average Response Time: %.2fms\n", avg)
	fmt.Printf("Min Response Time: %.2fms\n", minVal)
	fmt.Printf("Max Response Time: %.2fms\n", maxVal)
	fmt.Printf("Requests per second: %.2f\n", float64(atomic.LoadInt64(&s.successful))/s.testDuration.Seconds())
}

func main() {
	host := flag.String("host", "localhost", "Switch host")
	port := flag.Int("port", 8080, "Switch port")
	users := flag.Int("users", 10, "Number of concurrent users")
	duration := flag.Int("duration", 60, "Test duration in seconds")
	flag.Parse()

	s := &SwitchStressTest{
		switchHost:      *host,
		switchPort:      *port,
		concurrentUsers: *users,
		testDuration:    time.Duration(*duration) * time.Second,
	}

	fmt.Printf("Starting stress test with %d concurrent users\n", s.concurrentUsers)
	fmt.Printf("Test duration: %d seconds\n", *duration)
	fmt.Printf("Target switch: %s:%d\n", s.switchHost, s.switchPort)

	s.startTime = time.Now()
	ctx, cancel := context.WithTimeout(context.Background(), s.testDuration)
	defer cancel()

	var wg sync.WaitGroup
	for i := 0; i < s.concurrentUsers; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			s.singleClient(ctx)
		}(i)
	}
	wg.Wait()
	s.printStatistics()
}
