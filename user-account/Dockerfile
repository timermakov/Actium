# ---------- Builder ----------
FROM golang:1.24-alpine AS builder
RUN apk add --no-cache ca-certificates git
WORKDIR /build

RUN CGO_ENABLED=0 GOBIN=/build/bin go install github.com/pressly/goose/v3/cmd/goose@v3.24.1

COPY go.mod go.sum ./
RUN go mod download

COPY cmd/ ./cmd/
COPY migrations/ ./migrations/

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -buildvcs=false -ldflags="-s -w" -o /app-bin ./cmd/app/main.go

# ---------- Runtime ----------
FROM alpine:3.19
RUN apk add --no-cache ca-certificates tzdata bash
WORKDIR /app

COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder /etc/group /etc/group

COPY --from=builder /app-bin .
COPY --from=builder /build/bin/goose /app/goose
COPY --from=builder /build/migrations ./migrations
COPY docker-entrypoint.sh /app/docker-entrypoint.sh

RUN chown -R appuser:appgroup /app && chmod +x /app/goose /app/docker-entrypoint.sh

USER appuser
ENTRYPOINT ["/app/docker-entrypoint.sh"]