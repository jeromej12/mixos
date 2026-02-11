#!/bin/bash

echo "Starting MixOS Backend..."
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "No .env file found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "IMPORTANT: Edit backend/.env and add your Anthropic API key!"
    echo "Get it from: https://console.anthropic.com"
    echo ""
    exit 1
fi

# Check if credentials are set
if grep -q "your_anthropic_key_here" .env; then
    echo "Anthropic API key not configured!"
    echo "Edit backend/.env and add your ANTHROPIC_API_KEY"
    echo ""
    echo "Get it from: https://console.anthropic.com"
    exit 1
fi

echo "Environment configured"
echo "Starting FastAPI server on port 8000..."
echo ""

python -m app.main
