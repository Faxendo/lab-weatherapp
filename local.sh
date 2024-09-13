#!/bin/bash

# Check if frontend/out dir exists
if [ ! -d "frontend/out" ]; then
  echo "Unable to find built frontend."
  echo "Please run ./deploy.sh first"
  exit 1
fi

echo "==============================="
echo "Running frontend app locally..."
echo ""

cd frontend/out
npx http-server -o