package http

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"slices"
	"time"
)

type Request struct {
	Method         string
	URL            string
	APIToken       *string //optional
	RequestTimeout string
}

func CreateHTTPRequestAndClient(r Request) (http.Client, http.Request, error) {
	validHTTPMethods := []string{"POST", "GET", "DELETE", "PATCH"}

	// valid http method provided
	if !slices.Contains(validHTTPMethods, r.Method) {
		return http.Client{}, http.Request{}, fmt.Errorf("invalid method")
	}

	req, err := http.NewRequest(r.Method, r.URL, nil)

	if err != nil {
		return http.Client{}, http.Request{}, err
	}

	if r.APIToken != nil {
		req.Header.Set("Authorization", *r.APIToken)
	}

	// Set up the client
	tr := &http.Transport{
		DisableKeepAlives:   true,
		MaxIdleConnsPerHost: -1,
	}

	duration, err := time.ParseDuration(r.RequestTimeout)

	if err != nil {
		return http.Client{}, http.Request{}, err
	}

	return http.Client{
		Transport: tr,
		Timeout:   duration,
	}, *req, nil
}

// ReadResponse will read HTTP response to a generic interface
func ReadResponse[T interface{}](response *http.Response) (*T, error) {
	body, err := io.ReadAll(response.Body)

	if err != nil {
		return nil, err
	}

	// Check status code
	if response.StatusCode != 200 {
		return nil, fmt.Errorf("invalid HTTP status code")
	}

	// Unmarshal the response as a generic type
	var result T
	err = json.Unmarshal(body, &result)

	if err != nil {
		return nil, err
	}

	return &result, nil
}

func ExecuteRequest[T any](URL string, timeout string) (*T, error) {
	client, request, err := CreateHTTPRequestAndClient(Request{
		Method:         "GET",
		URL:            URL,
		RequestTimeout: timeout,
	})

	if err != nil {
		return nil, err
	}

	// Execute request
	resp, err := client.Do(&request)

	if err != nil {
		return nil, err
	}

	// Read the response if needed
	defer func() {
		err = resp.Body.Close()
	}()

	response, err := ReadResponse[T](resp)

	if err != nil {
		return nil, err
	}

	return response, nil
}
