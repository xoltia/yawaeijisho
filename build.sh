#!/bin/bash

echo "Building API server..."
cd "api"
npm i -D
npm run build

echo "Building client..."
cd "../client"
npm i -D
npm run build

echo "Building docker image..."
cd ".."
docker build --no-cache -t xoltia/yawaeijisho:latest .
