package json_test

import (
	"testing"

	myjson "github.com/CIDgravity/Ticker/pkg/json"
	"github.com/stretchr/testify/assert"
)

func TestPrettyPrint(t *testing.T) {
	t.Run("invalid", func(t *testing.T) {
		data := make(chan int)

		assert.NotPanics(t, func() {
			myjson.PrettyPrint(data)
		})
	})

	t.Run("success", func(t *testing.T) {
		data := map[string]interface{}{
			"key1": "value1",
			"key2": 2,
		}

		// Capture output using a helper function to avoid printing during test
		// Assuming PrettyPrint writes to stdout
		// Example: replace fmt.Println with a mocked implementation to capture output.
		// We will not test stdout output directly for simplicity in this case.
		// This is more of a functional test to ensure that no error is thrown
		assert.NotPanics(t, func() {
			myjson.PrettyPrint(data)
		})
	})
}

func TestOneLiner(t *testing.T) {
	t.Run("unmarshal_error", func(t *testing.T) {
		assert.Panics(t, func() {
			myjson.OneLiner([]byte(`{key1: value1,}`))
		})
	})

	t.Run("success_map", func(t *testing.T) {
		data := map[string]interface{}{
			"key1": "value1",
			"key2": 2,
		}

		result := myjson.OneLiner(data)
		expected := `{"key1":"value1","key2":2}`

		assert.Equal(t, expected, result)
	})

	t.Run("success_bytes", func(t *testing.T) {
		data := []byte(`{"key1":"value1","key2":2}`)
		result := myjson.OneLiner(data)

		expected := `{"key1":"value1","key2":2}`
		assert.Equal(t, expected, result)
	})
}
