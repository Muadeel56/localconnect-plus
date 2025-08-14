# Multi-stage build for Django backend
FROM python:3.11-slim AS base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
        curl \
        netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r django && useradd -r -g django django

# Set work directory
WORKDIR /app

# Development stage
FROM base AS development

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy project
COPY . .

# Change ownership to django user
RUN chown -R django:django /app
USER django

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/accounts/current-user/ || exit 1

# Default command
CMD ["python", "run_asgi.py"]

# Production stage
FROM base AS production

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt \
    && pip install gunicorn daphne

# Copy project
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Change ownership to django user
RUN chown -R django:django /app
USER django

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/accounts/current-user/ || exit 1

# Production command with Daphne for WebSocket support
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "localconnect_backend.asgi:application"] 