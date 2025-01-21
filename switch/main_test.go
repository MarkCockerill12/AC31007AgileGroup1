package main

import (
	"fmt"
	"testing"
)

func Test_getCardIssuer(t *testing.T) {
	tests := []struct {
		name string // description of this test case
		// Named input parameters for target function.
		cardNumber int
		want       string
		wantErr    bool
	}{
		{name: "4242424242424242", cardNumber: 4242424242424242, want: "visa", wantErr: false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, gotErr := getCardIssuer(tt.cardNumber)
			if gotErr != nil {
				if !tt.wantErr {
					t.Errorf("getCardIssuer() failed: %v", gotErr)
				}
				return
			}
			if tt.wantErr {
				t.Fatal("getCardIssuer() succeeded unexpectedly")
			}
			if got.Short != tt.want {
				t.Errorf("getCardIssuer() = %v, want %v", got, tt.want)
			}
		})
	}
}

func Test_parseCardInfo(t *testing.T) {
	tests := []struct {
		name string // description of this test case
		// Named input parameters for target function.
		request []byte
		want    Request
		wantErr bool
	}{
		{name: "testies",
			request: []byte(`{
		  "TnxID": "ATM1123456",
		  "TnxTime": "2025-01-20T14:30:45.123",
		  "TnxKind": 0,
		  "TnxAmount": 500.75,
		  "CardNumber": 4242424242424242,
		  "PIN": 1234
	    }`),
			want:    Request{TnxID: "ATM1123456", TnxTime: "2025-01-20T14:30:45.123", TnxKind: 0, TnxAmount: 500.75, CardNumber: 4242424242424242, PIN: 1234},
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, gotErr := parseCardInfo(tt.request)
			if gotErr != nil {
				if !tt.wantErr {
					t.Errorf("parseCardInfo() failed: %v", gotErr)
				}
				return
			}
			if tt.wantErr {
				t.Fatal("parseCardInfo() succeeded unexpectedly")
			}
			if got != tt.want {
				fmt.Println(getCardIssuer(got.CardNumber))
				t.Errorf("parseCardInfo() = %v, want %v", got, tt.want)
			}
		})
	}
}
