#!/bin/bash

# Docker Setup Script for LocalConnect+
# This script helps set up the Docker development environment

set -e

echo "🐳 Setting up LocalConnect+ Docker Development Environment"
echo "=========================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if we're in the project root
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Please run this script from the project root directory."
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ Created .env file. Please update it with your configuration."
    echo "⚠️  Don't forget to update the SECRET_KEY and database passwords!"
fi

# Create backend .env if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend .env file..."
    cp env.example backend/.env
    echo "✅ Created backend/.env file."
fi

# Build Docker images
echo "🏗️  Building Docker images..."
docker-compose build

# Start the services
echo "🚀 Starting services..."
docker-compose up -d db redis

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "📊 Running database migrations..."
docker-compose run --rm backend python manage.py migrate

# Create superuser (optional)
read -p "Do you want to create a superuser? (y/N): " create_superuser
if [[ $create_superuser =~ ^[Yy]$ ]]; then
    echo "👤 Creating superuser..."
    docker-compose run --rm backend python manage.py createsuperuser
fi

# Start all services
echo "🚀 Starting all services..."
docker-compose up -d

echo ""
echo "✅ Docker setup complete!"
echo ""
echo "🌐 Services are now running:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8000"
echo "   Database: localhost:5432"
echo "   Redis:    localhost:6379"
echo ""
echo "📋 Useful commands:"
echo "   Stop services:     docker-compose down"
echo "   View logs:         docker-compose logs -f"
echo "   Restart services:  docker-compose restart"
echo "   Rebuild images:    docker-compose build --no-cache"
echo ""
echo "🎉 Happy coding!" 