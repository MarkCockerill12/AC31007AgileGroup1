#!/usr/bin/env bash

# Build the Docker image
docker build -t ghcr.io/victorbratov/switch_repo/switch:latest -f Dockerfile .
docker push ghcr.io/victorbratov/switch_repo/switch:latest
