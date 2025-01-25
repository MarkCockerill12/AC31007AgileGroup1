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
		{name: "visa", cardNumber: 4242424242424242, want: "visa", wantErr: false},
		{name: "mastercard", cardNumber: 5555555555554444, want: "mastercard", wantErr: false},
		{name: "amex", cardNumber: 378282246310005, want: "amex", wantErr: false},
		{name: "number too short", cardNumber: 123, want: "", wantErr: true},
		{name: "number too long", cardNumber: 123456789012345890, want: "", wantErr: true},
		{name: "invalid number", cardNumber: 1234567890123456, want: "", wantErr: true},
		{name: "negative number", cardNumber: -4242424242424242, want: "", wantErr: true},
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
		{
			name: "normal transaction",
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
		{
			name: "wrong json format",
			request: []byte(`{
      "TnxID": "ATM1123456",
      "TnxTime": "2025-01-20T14:30:45.123",
      "TnxKind": 0,
      "TnxAmount": 500.75,
      "CardNumber": 42424242.42424242,
      "PIN": 1234
      }`),
			want:    Request{},
			wantErr: true,
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
