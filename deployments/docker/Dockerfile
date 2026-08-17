# ==============================================================================
# Stage 1: Build React + Vite Frontend
# ==============================================================================
FROM node:22-alpine AS web-builder
WORKDIR /app/web

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY web/package.json web/pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install

COPY web/ ./
RUN pnpm build

# ==============================================================================
# Stage 2: Compile Pure Go Single Binary
# ==============================================================================
FROM golang:1.23-alpine AS go-builder
WORKDIR /app

RUN apk add --no-cache git ca-certificates tzdata

COPY go.mod go.sum ./
RUN go mod download

COPY internal/ internal/
COPY cmd/ cmd/

# Copy compiled frontend assets from web-builder
COPY --from=web-builder /app/internal/embedded/dist internal/embedded/dist

RUN CGO_ENABLED=0 GOOS=linux go build \
    -ldflags="-s -w -X main.Version=0.1.0-alpha" \
    -o /app/kizuna ./cmd/kizuna

# ==============================================================================
# Stage 3: Minimal Scratch / Alpine Production Runtime
# ==============================================================================
FROM alpine:3.20
WORKDIR /app

RUN apk --no-cache add ca-certificates tzdata

# Create non-root runner user
RUN addgroup -S kizuna && adduser -S kizuna -G kizuna

COPY --from=go-builder /app/kizuna /usr/local/bin/kizuna

USER kizuna:kizuna
EXPOSE 8080

VOLUME ["/data"]
ENV KIZUNA_PORT=8080 \
    KIZUNA_HOST=0.0.0.0 \
    KIZUNA_DB_PATH=/data/kizuna.db \
    KIZUNA_DEMO_MODE=false

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8080/api/v1/health || exit 1

ENTRYPOINT ["/usr/local/bin/kizuna"]
