# 🐳 Docker Setup Guide

This guide explains how to set up and run LocalConnect+ using Docker for both development and production environments.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (2.0+)
- Git

## Quick Start (Development)

1. **Clone and setup:**
   ```bash
   git clone https://github.com/Muadeel56/localconnect-plus.git
   cd localconnect-plus
   ./tools/scripts/setup-docker.sh
   ```

2. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - Admin Panel: http://localhost:8000/admin

## Manual Setup

### Development Environment

1. **Create environment files:**
   ```bash
   cp env.example .env
   cp env.example backend/.env
   # Edit .env files with your configuration
   ```

2. **Build and start services:**
   ```bash
   docker-compose build
   docker-compose up -d
   ```

3. **Run database migrations:**
   ```bash
   docker-compose exec backend python manage.py migrate
   ```

4. **Create superuser:**
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

### Production Environment

1. **Create production environment file:**
   ```bash
   cp env.example .env.prod
   # Update .env.prod with production values
   ```

2. **Deploy with production compose:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Services Overview

### Development Services
- **frontend**: React development server (Vite)
- **backend**: Django with hot reload
- **db**: PostgreSQL database
- **redis**: Redis for caching and WebSocket

### Production Services
- **frontend**: React app served by Nginx
- **backend**: Django with Daphne (production ASGI server)
- **nginx**: Reverse proxy and static file server
- **db**: PostgreSQL database
- **redis**: Redis for caching and WebSocket
- **celery**: Background task worker
- **celery-beat**: Scheduled task runner

## Environment Variables

### Required Variables
```bash
SECRET_KEY=your-django-secret-key
DB_PASSWORD=your-database-password
```

### Optional Variables
```bash
DEBUG=False                    # Production: False
ALLOWED_HOSTS=yourdomain.com   # Production: your domain
DB_NAME=localconnect_db        # Database name
DB_USER=postgres               # Database user
REDIS_URL=redis://redis:6379/0 # Redis connection
```

## Docker Commands

### Basic Operations
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend

# Restart services
docker-compose restart

# Rebuild images
docker-compose build --no-cache
```

### Database Operations
```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Access database shell
docker-compose exec db psql -U postgres -d localconnect_db

# Backup database
docker-compose exec db pg_dump -U postgres localconnect_db > backup.sql
```

### Development Operations
```bash
# Install new Python package
docker-compose exec backend pip install package-name
docker-compose exec backend pip freeze > requirements.txt

# Install new Node.js package
docker-compose exec frontend npm install package-name

# Run Django management commands
docker-compose exec backend python manage.py collectstatic
docker-compose exec backend python manage.py shell
```

## File Structure

```
localconnect-plus/
├── docker-compose.yml          # Development compose
├── docker-compose.prod.yml     # Production compose
├── env.example                 # Environment template
├── backend/
│   ├── Dockerfile             # Backend Docker image
│   └── init-db.sql            # Database initialization
├── frontend/
│   ├── Dockerfile             # Frontend Docker image
│   └── nginx.conf             # Nginx configuration
└── tools/scripts/
    └── setup-docker.sh        # Setup automation script
```

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check what's using the port
   lsof -i :8000
   # Kill the process or change port in docker-compose.yml
   ```

2. **Database connection issues:**
   ```bash
   # Check database logs
   docker-compose logs db
   # Restart database
   docker-compose restart db
   ```

3. **Permission issues:**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

4. **Out of disk space:**
   ```bash
   # Clean up Docker
   docker system prune -a
   docker volume prune
   ```

### Health Checks

All services include health checks. Check service health:
```bash
docker-compose ps
```

### Performance Optimization

1. **Use .dockerignore files** to reduce build context
2. **Multi-stage builds** for smaller production images
3. **Volume caching** for node_modules and Python packages
4. **Resource limits** in production

## Security Considerations

### Development
- Default passwords are used (change for production)
- Debug mode is enabled
- All ports are exposed

### Production
- Use strong passwords and secrets
- Enable HTTPS with SSL certificates
- Restrict network access
- Regular security updates
- Non-root user execution

## Monitoring

### Logs
```bash
# All services
docker-compose logs -f

# Specific service with timestamp
docker-compose logs -f -t backend
```

### Resource Usage
```bash
# Container stats
docker stats

# Service-specific stats
docker stats localconnect_backend
```

## Backup and Recovery

### Database Backup
```bash
# Create backup
docker-compose exec db pg_dump -U postgres localconnect_db > backup_$(date +%Y%m%d).sql

# Restore backup
docker-compose exec -T db psql -U postgres localconnect_db < backup.sql
```

### Volume Backup
```bash
# Backup volumes
docker run --rm -v localconnect_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data
```

## Scaling

### Horizontal Scaling
```bash
# Scale backend service
docker-compose up -d --scale backend=3

# Scale with load balancer
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

## Support

For issues and questions:
- Check the [main README](../README.md)
- Review [GitHub Issues](https://github.com/Muadeel56/localconnect-plus/issues)
- Consult Docker documentation 