#!/bin/bash -e

BASE_DIR=$(pwd)

# Install dependencies
echo "=============================="
echo "Installing CDK dependencies..."
echo ""
npm install

# Install lambda dependencies
echo "================================="
echo "Installing Lambda dependencies..."
echo ""
cd lambda
npm install

# Return to base directory
cd $BASE_DIR

# Compile typescript
echo "======================="
echo "Compiling typescript..."
echo ""
tsc

# Run cdk deploy
echo "======================"
echo "Deploying CDK stack..."
echo ""
cdk bootstrap
cdk deploy

# Retrieve API Gateway URL from CDK
echo "============================================="
echo "Retrieving API Gateway URL from CDK output..."
echo ""
API_URL=$(cat ./cdk.out/output.json | jq -r '.WeatherAppStack.ApiURL')

# Go to frontend and deploy
echo "===================="
echo "Building frontend..."
echo ""
cd frontend
npm install
NEXT_PUBLIC_API_URL=$API_URL npm run build

echo "We are good to go !"