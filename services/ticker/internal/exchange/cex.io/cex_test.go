package cex_test

import (
	"net/http"
	"testing"

	cex "github.com/CIDgravity/Ticker/internal/exchange/cex.io"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	internalTesting "github.com/CIDgravity/Ticker/pkg/testing"
)

// TestFetchAndUnifiedResponse test the fetch and the conversion to unified response at the same time
func TestFetchAndUnifiedResponse(t *testing.T) {
	t.Run("pair_not_found", func(t *testing.T) {
		pair := "foobar"
		mockResponse := `
		{
			"ok":"ok",
			"data":{
				"FIL-USD":{
					"bestBid":"2.408"
				}
			}
		}`

		mockServer := internalTesting.NewMockExchange(t, mockResponse, http.StatusOK)
		defer mockServer.Close()

		cexExchange := cex.New()
		cexExchange.SetBaseURL(mockServer.URL)

		resp, err := cexExchange.Fetch(pair)
		require.Error(t, err)
		assert.Empty(t, resp)
		assert.ErrorContains(t, err, "pair not found")
	})

	t.Run("invalid_response", func(t *testing.T) {
		pair := "FIL_USD"
		mockResponse := `
		{
			"ok":"ok",
			"data":{
				"FIL-USD":{
					"volume": 20607.80841568
				}
			}
		}`

		mockServer := internalTesting.NewMockExchange(t, mockResponse, http.StatusOK)
		defer mockServer.Close()

		cexExchange := cex.New()
		cexExchange.SetBaseURL(mockServer.URL)

		resp, err := cexExchange.Fetch(pair)
		require.Error(t, err)
		assert.Empty(t, resp)
		assert.ErrorContains(t, err, "json: cannot unmarshal number into Go struct")
	})

	t.Run("invalid_value", func(t *testing.T) {
		pair := "FIL_USD"
		mockResponse := `
		{
			"ok":"ok",
			"data":{
				"FIL-USD":{
					"bestBidChange": "foobar"
				}
			}
		}`

		mockServer := internalTesting.NewMockExchange(t, mockResponse, http.StatusOK)
		defer mockServer.Close()

		cexExchange := cex.New()
		cexExchange.SetBaseURL(mockServer.URL)

		resp, err := cexExchange.Fetch(pair)
		require.Error(t, err)
		assert.Empty(t, resp)
		assert.ErrorContains(t, err, "invalid syntax")
	})

	t.Run("bad_request", func(t *testing.T) {
		pair := "FIL_USD"
		mockResponse := `{}`

		mockServer := internalTesting.NewMockExchange(t, mockResponse, http.StatusBadRequest)
		defer mockServer.Close()

		cexExchange := cex.New()
		cexExchange.SetBaseURL(mockServer.URL)

		resp, err := cexExchange.Fetch(pair)
		require.Error(t, err)
		assert.Empty(t, resp)
		assert.ErrorContains(t, err, "invalid HTTP status code")
	})

	t.Run("success", func(t *testing.T) {
		pair := "FIL_USD"
		mockResponse := `
		{
			"ok":"ok",
			"data":{
				"FIL-USD":{
					"bestBid":"2.408",
					"bestAsk":"2.409",
					"bestBidChange":"0.083",
					"bestBidChangePercentage":"3.56",
					"bestAskChange":"0.086",
					"bestAskChangePercentage":"3.70",
					"low":"2.479",
					"high":"2.479",
					"volume30d":"20607.80841568",
					"lastTradeDateISO":"2025-04-09T23:31:38.437Z",
					"volume":"10.23750000",
					"quoteVolume":"25.38388125",
					"lastTradeVolume":"10.23750000",
					"volumeUSD":"25.38",
					"last":"2.409",
					"lastTradePrice":"2.479",
					"priceChange":"0.086",
					"priceChangePercentage":"3.70"
				}
			}
		}`

		mockServer := internalTesting.NewMockExchange(t, mockResponse, http.StatusOK)
		defer mockServer.Close()

		cexExchange := cex.New()
		cexExchange.SetBaseURL(mockServer.URL)

		resp, err := cexExchange.Fetch(pair)
		require.NoError(t, err)
		assert.Equal(t, 2.4085, resp.Price)
		assert.Equal(t, 10.2375, resp.Volume)
	})
}
