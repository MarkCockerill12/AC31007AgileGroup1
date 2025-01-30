#!/usr/bin/env bash

docker build -t ghcr.io/victorbratov/logsweb/logsweb:latest .

docker push ghcr.io/victorbratov/logsweb/logsweb:latest
