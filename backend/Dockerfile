# Build stage
FROM golang:1.24-alpine AS builder
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go mod tidy && CGO_ENABLED=0 go build -o /saversure-api ./cmd/api

# Run stage
FROM alpine:3.21
RUN apk add --no-cache ca-certificates wget && \
    adduser -D -u 1000 appuser
WORKDIR /app

COPY --from=builder /saversure-api .
COPY migrations ./migrations

RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 30400
CMD ["./saversure-api"]
