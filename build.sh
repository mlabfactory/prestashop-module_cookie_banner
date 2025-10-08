#!/bin/bash
# Build script for MLab Cookie Policy Module
# This script compiles TypeScript and prepares the module for deployment

set -e  # Exit on any error

echo "🔨 Building MLab Cookie Policy Module..."
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    echo "Please install Node.js and npm first"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Compile TypeScript
echo "🔄 Compiling TypeScript..."
npx tsc

# Check if compilation was successful
if [ ! -f "assets/js/cookie-policy.js" ]; then
    echo "❌ Error: Compilation failed - JavaScript file not found"
    exit 1
fi

# Get file size
filesize=$(wc -c < "assets/js/cookie-policy.js" | tr -d ' ')

if [ "$filesize" -eq 0 ]; then
    echo "❌ Error: JavaScript file is empty"
    exit 1
fi

echo "✅ Compilation successful!"
echo "📄 Generated: assets/js/cookie-policy.js ($filesize bytes)"
echo ""
echo "✨ Module is ready for deployment!"
echo ""
echo "Next steps:"
echo "  1. Test the module locally"
echo "  2. Commit changes: git add . && git commit -m 'Build module'"
echo "  3. Create deployment ZIP or upload to PrestaShop"
