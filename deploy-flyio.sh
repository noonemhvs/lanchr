#!/bin/bash
# Fly.io deployment script
# Run this locally to deploy to Fly.io

set -e

echo "🚀 Deploying to Fly.io..."
echo ""

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "❌ flyctl not found. Install from: https://fly.io/docs/hands-on/install-flyctl/"
    exit 1
fi

# Check if user is logged in
if ! flyctl auth whoami > /dev/null 2>&1; then
    echo "⏳ Logging into Fly.io..."
    flyctl auth login
fi

# Generate secure JWT_SECRET if not set
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -hex 32)
    echo "🔐 Generated JWT_SECRET: $JWT_SECRET"
    echo ""
    echo "⚠️  Save this secret somewhere safe!"
    echo ""
fi

# Deploy
echo "📦 Deploying application..."
flyctl deploy

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Your app is now running at:"
flyctl info --json | jq -r '.appUrl' || echo "Check https://fly.io/dashboard for your app URL"
