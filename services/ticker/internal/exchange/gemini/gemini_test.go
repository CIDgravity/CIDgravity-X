package gemini_test

import (
	"net/http"
	"testing"

	"github.com/CIDgravity/Ticker/internal/exchange/gemini"

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
			"bid": 2.4531,
			"ask": "2.4552",
			"last": "2.4464",
			"volume": {
				"FIL": "2195.785464",
				"USD": "5371.7695591296",
				"timestamp": 1744441577000
			}
		}`

		mockServer := internalTesting.NewMockExchange(t, mockResponse, http.StatusOK)
		defer mockServer.Close()

		geminiExchange := gemini.New()
		geminiExchange.SetBaseURL(mockServer.URL)

		resp, err := geminiExchange.Fetch(pair)
		require.Error(t, err)
		assert.Empty(t, resp)
		assert.ErrorContains(t, err, "cannot unmarshal number into Go struct")
	})

	t.Run("volume_pair_not_found", func(t *testing.T) {
		pair := "FIL_USD"
		mockResponse := `
		{
			"bid": "2.4531",
			"ask": "2.4552",
			"last": "2.4464",
			"volume": {
				"FOO": "2195.785464",
				"BAR": "5371.7695591296",
				"timestamp": 1744441577000
			}
		}`

		mockServer := internalTesting.NewMockExchange(t, mockResponse, http.StatusOK)
		defer mockServer.Close()

		geminiExchange := gemini.New()
		geminiExchange.SetBaseURL(mockServer.URL)

		resp, err := geminiExchange.Fetch(pair)
		require.Error(t, err)

		assert.Empty(t, resp)
		assert.ErrorContains(t, err, "volume not found")
	})

	t.Run("invalid_config_pair", func(t *testing.T) {
		pair := "foobar"
		mockResponse := `
		{
			"bid": "2.4531",
			"ask": "2.4552",
			"last": "2.4464",
			"volume": {
				"FIL": "2195.785464",
				"USD": "5371.7695591296",
				"timestamp": 1744441577000
			}
		}`

		mockServer := internalTesting.NewMockExchange(t, mockResponse, http.StatusOK)
		defer mockServer.Close()

		geminiExchange := gemini.New()
		geminiExchange.SetBaseURL(mockServer.URL)

		resp, err := geminiExchange.Fetch(pair)
		require.Error(t, err)

		assert.Empty(t, resp)
		assert.ErrorContains(t, err, "pair not found")
	})

	t.Run("bad_request", func(t *testing.T) {
		pair := "FIL_USD"
		mockResponse := `{}`

		mockServer := internalTesting.NewMockExchange(t, mockResponse, http.StatusBadRequest)
		defer mockServer.Close()

		geminiExchange := gemini.New()
		geminiExchange.SetBaseURL(mockServer.URL)

		resp, err := geminiExchange.Fetch(pair)
		require.Error(t, err)
		assert.Empty(t, resp)
		assert.ErrorContains(t, err, "invalid HTTP status code")
	})

	t.Run("success", func(t *testing.T) {
		pair := "FIL_USD"
		mockResponse := `
		{
			"bid": "2.4531",
			"ask": "2.4552",
			"last": "2.4464",
			"volume": {
				"FIL": "2195.785464",
				"USD": "5371.7695591296",
				"timestamp": 1744441577000
			}
		}`

		mockServer := internalTesting.NewMockExchange(t, mockResponse, http.StatusOK)
		defer mockServer.Close()

		geminiExchange := gemini.New()
		geminiExchange.SetBaseURL(mockServer.URL)

		// Mock the pair resolution
		resp, err := geminiExchange.Fetch(pair)
		require.NoError(t, err)
		assert.Equal(t, 2.4541500000000003, resp.Price)
		assert.Equal(t, 2195.785464, resp.Volume)
	})
}
