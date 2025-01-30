#!/bin/bash

# Build the Docker image
docker build -t ghcr.io/victorbratov/sim/simpython:latest .
docker push ghcr.io/victorbratov/sim/simpython:latest
