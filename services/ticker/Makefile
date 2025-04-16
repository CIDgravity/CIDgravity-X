# Variables
main_path = ./cmd/ticker/main.go
binary = cidgravity-ticker

# Get current git tag or commit hash for binary version
VERSION := $(shell scripts/get-git-tag-or-hash.sh)

# Use linker flags to provide version/build settings
LDFLAGS=-ldflags "-X=main.version=$(VERSION)"

all: audit build

build: ## build the go application
	make clean
	make tidy
	go build $(LDFLAGS) -o ${binary} ${main_path}

tidy: ## download dependencies
	go mod tidy
	go mod download

test-coverage: ## runs tests and create generates coverage report
	make tidy
	make vendor
	mkdir -p tmp/
	go test -v -timeout 10m ./... -coverprofile=tmp/coverage.out -json > tmp/report.json

test: ## runs tests
	make tidy
	make vendor
	go test -v -timeout 10m ./...

audit: ## runs code quality checks
	go mod verify
	go fmt ./...
	go vet ./...
	go run honnef.co/go/tools/cmd/staticcheck@latest -checks=all,-ST1000,-U1000 ./...
	go run golang.org/x/vuln/cmd/govulncheck@latest ./...

clean: ## cleans binary and other generated files
	go clean
	rm -f tmp/coverage.out tmp/report.json ${binary}

lint: ## go linting
	make tidy
	golangci-lint run

coverage: ## displays test coverage report in html mode
	make test
	go tool cover -html=tmp/coverage.out

openapi: # Build openapi docs
	redocly build-docs openapi.json --output docs/index.html

.PHONY: vendor
vendor: ## all packages required to support builds and tests in the /vendor directory
	go mod vendor
