#!/usr/bin/env bash

docker pull ghcr.io/victorbratov/logsWeb/logsWeb:latest

docker run -d \
  --name logsWeb \
  -v ./logs:/app/logs \
  -e LOGS_PATH_NAME=logs \
  -e PORT=8000 \
  -p 8000:8000 \
  --restart unless-stopped \
  ghcr.io/victorbratov/logsWeb/logsWeb:latest
