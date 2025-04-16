package http_test

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	internalHttp "github.com/CIDgravity/Ticker/pkg/http"
	"github.com/stretchr/testify/assert"
)

func TestCreateHTTPRequestAndClient(t *testing.T) {
	t.Run("invalid_method", func(t *testing.T) {
		_, _, err := internalHttp.CreateHTTPRequestAndClient(internalHttp.Request{
			Method:         "",
			URL:            "http://example.com",
			RequestTimeout: "1s",
		})
		assert.Error(t, err)
	})

	t.Run("invalid_timeout", func(t *testing.T) {
		_, _, err := internalHttp.CreateHTTPRequestAndClient(internalHttp.Request{
			Method:         "GET",
			URL:            "http://example.com",
			RequestTimeout: "not-a-duration",
		})
		assert.Error(t, err)
	})

	t.Run("valid_no_auth", func(t *testing.T) {
		client, req, err := internalHttp.CreateHTTPRequestAndClient(internalHttp.Request{
			Method:         "GET",
			URL:            "http://example.com",
			RequestTimeout: "2s",
		})
		assert.NoError(t, err)
		assert.Equal(t, "GET", req.Method)
		assert.Equal(t, "http://example.com", req.URL.String())
		assert.Equal(t, 2*time.Second, client.Timeout)
	})

	t.Run("valid_with_auth", func(t *testing.T) {
		token := "Bearer foobar"
		_, req, err := internalHttp.CreateHTTPRequestAndClient(internalHttp.Request{
			Method:         "GET",
			URL:            "http://example.com",
			APIToken:       &token,
			RequestTimeout: "1s",
		})
		assert.NoError(t, err)
		assert.Equal(t, "Bearer foobar", req.Header.Get("Authorization"))
	})
}

func TestReadResponse(t *testing.T) {

	t.Run("invalid_not_ok_status_code", func(t *testing.T) {
		resp := &http.Response{
			StatusCode: 404,
			Body:       io.NopCloser(bytes.NewReader([]byte(`{"message": "not found"}`))),
		}
		_, err := internalHttp.ReadResponse[map[string]interface{}](resp)
		assert.Error(t, err)
	})

	t.Run("invalid_response_body", func(t *testing.T) {
		resp := &http.Response{
			StatusCode: 200,
			Body:       io.NopCloser(bytes.NewReader([]byte("not json"))),
		}
		_, err := internalHttp.ReadResponse[map[string]interface{}](resp)
		assert.Error(t, err)
	})

	t.Run("success", func(t *testing.T) {
		type testStruct struct {
			Message string `json:"message"`
		}

		expected := testStruct{Message: "foobar"}
		data, _ := json.Marshal(expected)

		resp := &http.Response{
			StatusCode: 200,
			Body:       io.NopCloser(bytes.NewReader(data)),
		}

		result, err := internalHttp.ReadResponse[testStruct](resp)
		assert.NoError(t, err)
		assert.Equal(t, expected.Message, result.Message)
	})
}

func TestExecuteRequest(t *testing.T) {
	t.Run("timeout", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			time.Sleep(2 * time.Second)

			if _, err := w.Write([]byte(`{"message": "slow"}`)); err != nil {
				t.Errorf("failed to write response: %v", err)
			}
		}))
		defer server.Close()

		_, err := internalHttp.ExecuteRequest[map[string]string](server.URL, "500ms")
		assert.Error(t, err)
	})

	t.Run("invalid URL", func(t *testing.T) {
		_, err := internalHttp.ExecuteRequest[map[string]string](":://bad-url", "1s")
		assert.Error(t, err)
	})

	t.Run("success", func(t *testing.T) {
		type testData struct {
			Name string `json:"name"`
		}
		expected := testData{Name: "JohnDoe"}
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if err := json.NewEncoder(w).Encode(expected); err != nil {
				t.Errorf("failed to encode response: %v", err)
			}
		}))
		defer server.Close()

		result, err := internalHttp.ExecuteRequest[testData](server.URL, "1s")
		assert.NoError(t, err)
		assert.Equal(t, expected.Name, result.Name)
	})
}
