.PHONY: all build test lint dev clean docker

BINARY_NAME=bin/kizuna
VERSION=0.1.0-alpha

all: test build

## Install dependencies
deps:
	go mod download
	cd web && pnpm install

## Run Go unit tests with race detection
test:
	go test -v -race ./...

## Build frontend assets
build-frontend:
	cd web && pnpm build

## Build single embedded production binary
build: build-frontend
	@mkdir -p bin
	go build -ldflags="-s -w -X main.Version=$(VERSION)" -o $(BINARY_NAME) ./cmd/kizuna

## Run backend with live demo mode
dev: build-frontend
	go run ./cmd/kizuna --demo --port 8080

## Build multi-stage Docker image
docker:
	docker build -t blackstart-labs/kizuna:$(VERSION) -f deployments/docker/Dockerfile .

clean:
	rm -rf bin/ $(BINARY_NAME) internal/embedded/dist/ kizuna.db*
