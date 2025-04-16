package crypto_test

import (
	"net/http"
	"testing"

	crypto "github.com/CIDgravity/Ticker/internal/exchange/crypto.com"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	internalTesting "github.com/CIDgravity/Ticker/pkg/testing"
)

// TestFetchAndUnifiedResponse test the fetch and the conversion to unified response at the same time
func TestFetchAndUnifiedResponse(t *testing.T) {
	t.Run("invalid_response", func(t *testing.T) {
		pair := "FIL_USD"
		mockResponse := `
		{
			"id" : -1,
			"method" : "public/get-tickers",
			"code" : 0,
			"result" : {
				"data" : [ 
					{
						"i" : "FIL_USD",
						"h" : 2.5363
					}
				]
			}
		}`

		mockServer := internalTesting.NewMockExchange(t, mockResponse, http.StatusOK)
		defer mockServer.Close()

		cryptoExchange := crypto.New()
		cryptoExchange.SetBaseURL(mockServer.URL)

		resp, err := cryptoExchange.Fetch(pair)
		require.Error(t, err)
		assert.Empty(t, resp)
		assert.ErrorContains(t, err, "cannot unmarshal number into Go struct")
	})

	t.Run("invalid_value", func(t *testing.T) {
		pair := "FIL_USD"
		mockResponse := `
		{
			"id" : -1,
			"method" : "public/get-tickers",
			"code" : 0,
			"result" : {
				"data" : [ 
					{
						"i" : "FIL_USD",
						"h" : "foobar"
					}
				]
			}
		}`

		mockServer := internalTesting.NewMockExchange(t, mockResponse, http.StatusOK)
		defer mockServer.Close()

		cryptoExchange := crypto.New()
		cryptoExchange.SetBaseURL(mockServer.URL)

		resp, err := cryptoExchange.Fetch(pair)
		require.Error(t, err)
		assert.Empty(t, resp)
		assert.ErrorContains(t, err, "invalid syntax")
	})

	t.Run("bad_request", func(t *testing.T) {
		pair := "FIL_USD"
		mockResponse := `{}`

		mockServer := internalTesting.NewMockExchange(t, mockResponse, http.StatusBadRequest)
		defer mockServer.Close()

		cryptoExchange := crypto.New()
		cryptoExchange.SetBaseURL(mockServer.URL)

		resp, err := cryptoExchange.Fetch(pair)
		require.Error(t, err)
		assert.Empty(t, resp)
		assert.ErrorContains(t, err, "invalid HTTP status code")
	})

	t.Run("success", func(t *testing.T) {
		pair := "FIL_USD"
		mockResponse := `
		{
			"id" : -1,
			"method" : "public/get-tickers",
			"code" : 0,
			"result" : {
				"data" : [ 
					{
						"i" : "FIL_USD",
						"h" : "2.5363",
						"l" : "2.2837",
						"a" : "2.4142",
						"v" : "24190.15",
						"vv" : "58892.84",
						"c" : "0.0373",
						"b" : "2.4074",
						"k" : "2.4120",
						"oi" : "0",
						"t" : 1744272739898
					}
				]
			}
		}`

		mockServer := internalTesting.NewMockExchange(t, mockResponse, http.StatusOK)
		defer mockServer.Close()

		cryptoExchange := crypto.New()
		cryptoExchange.SetBaseURL(mockServer.URL)

		resp, err := cryptoExchange.Fetch(pair)
		require.NoError(t, err)
		assert.Equal(t, 2.4097, resp.Price)
		assert.Equal(t, 24190.15, resp.Volume)
	})
}
