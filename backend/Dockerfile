# Stage 1: Build the Go application
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copy go.mod and go.sum to download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the application source code
COPY . .

# Build the application
# -ldflags="-w -s" strips debug information, reducing binary size
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /joblog ./cmd/server

# Stage 2: Create the final, minimal image
FROM alpine:latest

WORKDIR /app

# Copy the static frontend assets
COPY --from=builder /app/web ./web

# Copy the built binary from the builder stage
COPY --from=builder /joblog .

# Expose the port the application will run on
EXPOSE 8080

# Command to run the executable
CMD ["./joblog"]
