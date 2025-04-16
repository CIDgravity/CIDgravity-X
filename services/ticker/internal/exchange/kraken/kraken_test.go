package kraken_test

import (
	"net/http"
	"testing"

	"github.com/CIDgravity/Ticker/internal/exchange/kraken"

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
			"error": [],
			"result": {
				"FILUSD": {
					"a": "2.40600",
					"b": "2976"
				}
			}
		}`

		mockServer := internalTesting.NewMockExchange(t, mockResponse, http.StatusOK)
		defer mockServer.Close()

		krakenExchange := kraken.New()
		krakenExchange.SetBaseURL(mockServer.URL)

		resp, err := krakenExchange.Fetch(pair)
		require.Error(t, err)
		assert.Empty(t, resp)
		assert.ErrorContains(t, err, "cannot unmarshal string into Go struct")
	})

	t.Run("invalid_values_count", func(t *testing.T) {
		pair := "FIL_USD"
		mockResponse := `
		{
			"error": [],
			"result": {
				"FILUSD": {
					"a": ["2.40600"],
					"b": ["2976"]
				}
			}
		}`

		mockServer := internalTesting.NewMockExchange(t, mockResponse, http.StatusOK)
		defer mockServer.Close()

		krakenExchange := kraken.New()
		krakenExchange.SetBaseURL(mockServer.URL)

		resp, err := krakenExchange.Fetch(pair)
		require.Error(t, err)
		assert.Empty(t, resp)
		assert.ErrorContains(t, err, "invalid values: number of elements for bid, ask or volume")
	})

	t.Run("bad_request", func(t *testing.T) {
		pair := "FIL_USD"
		mockResponse := `{}`

		mockServer := internalTesting.NewMockExchange(t, mockResponse, http.StatusBadRequest)
		defer mockServer.Close()

		krakenExchange := kraken.New()
		krakenExchange.SetBaseURL(mockServer.URL)

		resp, err := krakenExchange.Fetch(pair)
		require.Error(t, err)
		assert.Empty(t, resp)
		assert.ErrorContains(t, err, "invalid HTTP status code")
	})

	t.Run("success", func(t *testing.T) {
		pair := "FIL_USD"
		mockResponse := `
		{
			"error": [],
			"result": {
				"FILUSD": {
					"a": ["2.40600","1693","1693.000"],
					"b": ["2.40400","2976","2976.000"],
					"c": ["2.40900","120.13494810"],
					"v": ["20266.86995345","191581.17323023"],
					"p": ["2.42500","2.46280"],
					"t": [119, 953],
					"l": ["2.38800", "2.28000"],
					"h": ["2.47300","2.53100"],
					"o": "2.47300"
				}
			}
		}`

		mockServer := internalTesting.NewMockExchange(t, mockResponse, http.StatusOK)
		defer mockServer.Close()

		krakenExchange := kraken.New()
		krakenExchange.SetBaseURL(mockServer.URL)

		resp, err := krakenExchange.Fetch(pair)
		require.NoError(t, err)
		assert.Equal(t, 2.4050000000000002, resp.Price)
		assert.Equal(t, 191581.17323023, resp.Volume)
	})
}
