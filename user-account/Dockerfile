# ---------- Builder ----------
FROM golang:1.24-alpine AS builder

RUN apk add --no-cache ca-certificates

WORKDIR /build

COPY go.mod go.sum ./
RUN go mod download

COPY cmd/ ./cmd/
COPY migrations/ ./migrations/

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" -o /app-bin ./cmd/app/main.go

# ---------- Runtime ----------
FROM alpine:3.19

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder /etc/group /etc/group

COPY --from=builder /app-bin .

COPY --from=builder /build/migrations ./migrations

RUN chown -R appuser:appgroup /app

USER appuser

CMD ["./app-bin"]