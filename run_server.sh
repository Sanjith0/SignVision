#!/bin/bash

# SignVision Server Launcher
# This script starts the FastAPI backend server

echo "SignVision - Starting Backend Server"
echo "===================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo ""
    echo "⚠️  WARNING: .env file not found!"
    echo "📝 Creating .env from template..."
    cp env.example .env
    echo ""
    echo "⚠️  Please edit .env and add your GEMINI_API_KEY"
    echo "   Then run this script again."
    echo ""
    echo "Press Ctrl+C to exit or Enter to continue anyway..."
    read
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo ""
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies if needed
echo "Checking dependencies..."
pip install -q -r requirements.txt

# Check if .env has API key
if grep -q "your_api_key_here" .env 2>/dev/null; then
    echo ""
    echo "⚠️  WARNING: Please update GEMINI_API_KEY in .env file"
    echo ""
fi

echo ""
echo "🚀 Starting FastAPI server..."
echo "   Server will be available at: http://localhost:8000"
echo "   API docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
python server.py

