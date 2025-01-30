# Use the official Go image as the base image
FROM golang:1.23.4 AS builder

# Set the working directory inside the container
WORKDIR /app

# Ensure the binary is statically linked
ENV CGO_ENABLED=0 GOOS=linux

# Copy Go modules manifests and download dependencies
COPY go.mod ./
RUN go mod download

# Copy the application source code
COPY . .

# Build a static Go binary
RUN go build -o switch -ldflags "-extldflags=-static" main.go

# Use a minimal base image for the runtime
FROM scratch

# Set the working directory inside the runtime container
WORKDIR /app

# Copy the statically compiled binary
COPY --from=builder /app/switch /app/switch

# Expose the port the application listens on
EXPOSE 8000

# Run the application
CMD ["/app/switch"]
