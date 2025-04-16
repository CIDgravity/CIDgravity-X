package testing

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"runtime"
	"testing"
)

func NewMockExchange(t *testing.T, jsonResponse string, statusCode int) *httptest.Server {
	t.Helper()

	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(statusCode)

		if _, err := fmt.Fprint(w, jsonResponse); err != nil {
			t.Errorf("failed to write response: %v", err)
		}
	}))
}

func GetTestPathForData(t *testing.T, folder string) string {
	_, testFile, _, ok := runtime.Caller(1)
	if !ok {
		t.Fatal("Could not determine caller location")
	}

	baseDir := filepath.Dir(testFile)
	return filepath.Join(baseDir, folder)
}
