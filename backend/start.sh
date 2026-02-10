#!/bin/bash

echo "🎵 Starting MixOS Backend..."
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Edit backend/.env and add your Spotify credentials!"
    echo "Get them from: https://developer.spotify.com/dashboard"
    echo ""
    exit 1
fi

# Check if credentials are set
if grep -q "your_client_id_here" .env; then
    echo "⚠️  Spotify credentials not configured!"
    echo "Edit backend/.env and add your:"
    echo "  - SPOTIFY_CLIENT_ID"
    echo "  - SPOTIFY_CLIENT_SECRET"
    echo ""
    echo "Get them from: https://developer.spotify.com/dashboard"
    exit 1
fi

echo "✅ Environment configured"
echo "🚀 Starting FastAPI server on port 8000..."
echo ""

python -m app.main
