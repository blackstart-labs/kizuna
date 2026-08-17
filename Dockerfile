# syntax=docker/dockerfile:1

# Stage 1: Build React 19 Frontend
FROM node:22-alpine AS web-builder
WORKDIR /app/web
COPY web/package.json ./
RUN npm install
COPY web/ ./
RUN npm run build

# Stage 2: Build Static Go Binary
FROM golang:1.23-alpine AS go-builder
WORKDIR /app
RUN apk add --no-cache git
COPY go.mod go.sum ./
RUN go mod download
COPY cmd/ cmd/
COPY internal/ internal/
COPY --from=web-builder /app/internal/embedded/dist internal/embedded/dist
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w -X main.Version=0.2.0" -o /app/kizuna ./cmd/kizuna

# Stage 3: Minimal Production Container (< 25 MB)
FROM alpine:3.20
RUN apk add --no-cache ca-certificates tzdata
WORKDIR /app

# Create non-root user and data volume directory
RUN addgroup -S kizuna && adduser -S kizuna -G kizuna
RUN mkdir -p /app/data && chown -R kizuna:kizuna /app/data

COPY --from=go-builder /app/kizuna /app/kizuna

USER kizuna:kizuna
EXPOSE 8080

ENV KIZUNA_HOST=0.0.0.0 \
    KIZUNA_PORT=8080 \
    KIZUNA_DB_PATH=/app/data/kizuna.db \
    KIZUNA_DEMO_MODE=false

VOLUME ["/app/data"]

ENTRYPOINT ["/app/kizuna"]
