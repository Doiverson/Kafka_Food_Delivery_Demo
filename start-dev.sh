#!/bin/bash

echo "🚀 Starting Kafka Food Delivery Demo in Development Mode..."

# Check if Docker and Docker Compose are available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "🐳 Starting services with Docker Compose (Development Mode)..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "📱 Access the application:"
echo "   Frontend: http://localhost:3000 (with hot reload)"
echo "   Kafka UI: http://localhost:8080"
echo ""
echo "🛠️  Service APIs:"
echo "   Order Service:      http://localhost:3001/api"
echo "   Restaurant Service: http://localhost:3002/api"
echo "   Delivery Service:   http://localhost:3003/api"
echo ""
echo "📝 Development Notes:"
echo "   - Frontend changes will be reflected immediately (hot reload)"
echo "   - Edit files in frontend/src/ to see changes"
echo "   - Backend services require restart for changes"
echo ""
echo "🛑 To stop all services:"
echo "   Press Ctrl+C"