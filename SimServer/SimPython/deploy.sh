#!/usr/bin/env bash

docker pull ghcr.io/victorbratov/sim/simpython:latest

# Stop and remove the previous container if it exists
docker stop switch || true
docker rm switch || true

# Run the new container with the specified volume mount
docker run -d \
  --name sim \
  -v ./logs:/app/logs \
  --restart unless-stopped \
  ghcr.io/victorbratov/sim/simpython:latest
