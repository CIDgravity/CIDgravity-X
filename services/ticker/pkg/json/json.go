package json

import (
	"bytes"
	"encoding/json"
	"fmt"
)

func PrettyPrint(data interface{}) {
	b, err := json.MarshalIndent(data, "", "  ")

	if err != nil {
		fmt.Println(err)
	}

	fmt.Println(string(b))
}

func OneLiner(data interface{}) string {

	// If data is a []byte, function MarshalIndent must not be called
	var dataAsByteArray []byte

	switch v := data.(type) {
	case []byte:
		dataAsByteArray = v

	default:
		b, err := json.MarshalIndent(data, "", "  ")

		if err != nil {
			fmt.Println(err)
		}

		dataAsByteArray = b
	}

	// Execute compact function to obtain one line json
	dst := &bytes.Buffer{}
	if err := json.Compact(dst, dataAsByteArray); err != nil {
		panic(err)
	}

	return dst.String()
}
