#!/bin/bash

echo "🚀 Starting Kafka Food Delivery Demo..."

# Check if Docker and Docker Compose are available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "📦 Installing frontend dependencies..."
cd frontend && npm install --legacy-peer-deps
cd ..

echo "🐳 Starting services with Docker Compose..."
docker-compose up --build -d

echo "⏳ Waiting for services to be ready..."
sleep 30

echo "🎯 Checking service health..."

# Check Order Service
if curl -f http://localhost:3001/api/health &> /dev/null; then
    echo "✅ Order Service is running (http://localhost:3001)"
else
    echo "❌ Order Service is not responding"
fi

# Check Restaurant Service
if curl -f http://localhost:3002/api/health &> /dev/null; then
    echo "✅ Restaurant Service is running (http://localhost:3002)"
else
    echo "❌ Restaurant Service is not responding"
fi

# Check Delivery Service
if curl -f http://localhost:3003/api/health &> /dev/null; then
    echo "✅ Delivery Service is running (http://localhost:3003)"
else
    echo "❌ Delivery Service is not responding"
fi

# Check Frontend
if curl -f http://localhost:3000 &> /dev/null; then
    echo "✅ Frontend is running (http://localhost:3000)"
else
    echo "❌ Frontend is not responding"
fi

echo ""
echo "🎉 Kafka Food Delivery Demo is ready!"
echo ""
echo "📱 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Kafka UI: http://localhost:8080"
echo ""
echo "🛠️  Service APIs:"
echo "   Order Service:      http://localhost:3001/api"
echo "   Restaurant Service: http://localhost:3002/api"
echo "   Delivery Service:   http://localhost:3003/api"
echo ""
echo "📊 To view logs:"
echo "   docker-compose logs -f [service-name]"
echo ""
echo "🛑 To stop all services:"
echo "   docker-compose down"