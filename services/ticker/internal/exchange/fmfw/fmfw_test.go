package fmfw_test

import (
	"net/http"
	"testing"

	"github.com/CIDgravity/Ticker/internal/exchange/fmfw"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	internalTesting "github.com/CIDgravity/Ticker/pkg/testing"
)

// TestFetchAndUnifiedResponse test the fetch and the conversion to unified response at the same time
func TestFetchAndUnifiedResponse(t *testing.T) {
	t.Run("pair_not_found", func(t *testing.T) {
		pair := "FOO_BAR"
		mockResponse := `{}`

		mockServer := internalTesting.NewMockExchange(t, mockResponse, http.StatusOK)
		defer mockServer.Close()

		fmfwExchange := fmfw.New()
		fmfwExchange.SetBaseURL(mockServer.URL)

		resp, err := fmfwExchange.Fetch(pair)
		require.Error(t, err)
		assert.Empty(t, resp)
		assert.ErrorContains(t, err, "pair not found")
	})

	t.Run("invalid_response", func(t *testing.T) {
		pair := "FIL_USD"
		mockResponse := `
		{
			"FILUSDT": {
				"ask": 2.4128
			}
		}`

		mockServer := internalTesting.NewMockExchange(t, mockResponse, http.StatusOK)
		defer mockServer.Close()

		fmfwExchange := fmfw.New()
		fmfwExchange.SetBaseURL(mockServer.URL)

		resp, err := fmfwExchange.Fetch(pair)
		require.Error(t, err)
		assert.Empty(t, resp)
		assert.ErrorContains(t, err, "cannot unmarshal number into Go struct")
	})

	t.Run("invalid_value", func(t *testing.T) {
		pair := "FIL_USD"
		mockResponse := `
		{
			"FILUSDT": {
				"high": "foobar"
			}
		}`

		mockServer := internalTesting.NewMockExchange(t, mockResponse, http.StatusOK)
		defer mockServer.Close()

		fmfwExchange := fmfw.New()
		fmfwExchange.SetBaseURL(mockServer.URL)

		resp, err := fmfwExchange.Fetch(pair)
		require.Error(t, err)
		assert.Empty(t, resp)
		assert.ErrorContains(t, err, "invalid syntax")
	})

	t.Run("bad_request", func(t *testing.T) {
		pair := "FIL_USD"
		mockResponse := `{}`

		mockServer := internalTesting.NewMockExchange(t, mockResponse, http.StatusBadRequest)
		defer mockServer.Close()

		fmfwExchange := fmfw.New()
		fmfwExchange.SetBaseURL(mockServer.URL)

		resp, err := fmfwExchange.Fetch(pair)
		require.Error(t, err)
		assert.Empty(t, resp)
		assert.ErrorContains(t, err, "invalid HTTP status code")
	})

	t.Run("success", func(t *testing.T) {
		pair := "FIL_USD"
		mockResponse := `
		{
			"FILUSDT": {
				"ask": "2.4128",
				"bid": "2.4087",
				"last": "2.4126",
				"low": "2.2796",
				"high": "2.5321",
				"open": "2.3252",
				"volume": "262379.462",
				"volume_quote": "632768.1805284",
				"timestamp": "2025-04-10T08:15:20.314Z"
			}
		}`

		mockServer := internalTesting.NewMockExchange(t, mockResponse, http.StatusOK)
		defer mockServer.Close()

		fmfwExchange := fmfw.New()
		fmfwExchange.SetBaseURL(mockServer.URL)

		resp, err := fmfwExchange.Fetch(pair)
		require.NoError(t, err)
		assert.Equal(t, 2.41075, resp.Price)
		assert.Equal(t, 262379.462, resp.Volume)
	})
}
