package bitfinex_test

import (
	"net/http"
	"testing"

	"github.com/CIDgravity/Ticker/internal/exchange/bitfinex"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	internalTesting "github.com/CIDgravity/Ticker/pkg/testing"
)

// TestFetchAndUnifiedResponse test the fetch and the conversion to unified response at the same time
func TestFetchAndUnifiedResponse(t *testing.T) {

	t.Run("bad_request", func(t *testing.T) {
		pair := "FIL_USD"
		mockResponse := `{}`

		mockServer := internalTesting.NewMockExchange(t, mockResponse, http.StatusBadRequest)
		defer mockServer.Close()

		bitfinexExchange := bitfinex.New()
		bitfinexExchange.SetBaseURL(mockServer.URL)

		resp, err := bitfinexExchange.Fetch(pair)
		require.Error(t, err)
		assert.Empty(t, resp)
		assert.ErrorContains(t, err, "invalid HTTP status code")
	})

	t.Run("success", func(t *testing.T) {
		pair := "FIL_USD"
		mockResponse := `
		{
			"mid": "2.50795",
			"bid": "2.5062",
			"ask": "2.5097",
			"last_price": "2.5084",
			"low": "2.4951",
			"high": "2.6006",
			"volume": "16569.54422086",
			"timestamp": "1744712431.461458"
		}`

		mockServer := internalTesting.NewMockExchange(t, mockResponse, http.StatusOK)
		defer mockServer.Close()

		bitfinexExchange := bitfinex.New()
		bitfinexExchange.SetBaseURL(mockServer.URL)

		resp, err := bitfinexExchange.Fetch(pair)
		require.NoError(t, err)
		assert.Equal(t, 2.50795, resp.Price)
		assert.Equal(t, 16569.54422086, resp.Volume)
	})
}
