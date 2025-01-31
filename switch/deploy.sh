#!/usr/bin/env bash

docker pull ghcr.io/victorbratov/switch_repo/switch:latest

# Stop and remove the previous container if it exists
docker stop switch || true
docker rm switch || true

# Run the new container with the specified volume mount
docker run -d \
  --name switch \
  -p 8080:8080 \
  -v ./logs:/app/logs \
  -e SWITCH_PORT=8080 \
  -e NETWORKS_ADDRESSES='{"visa":"52.90.150.134:31007", "mastercard":"52.90.150.134:31007", "amex":"52.90.150.134:31007"}' \
  --restart unless-stopped \
  ghcr.io/victorbratov/switch_repo/switch:latest
