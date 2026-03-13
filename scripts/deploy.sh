#!/bin/bash

# Factory Management Platform - Deployment Script
# Usage: ./scripts/deploy.sh [development|production]

set -e

# Configuration
ENVIRONMENT=${1:-development}
PROJECT_DIR="/opt/factory-management-platform"
BACKUP_DIR="/opt/backups/factory-platform"
LOG_FILE="/var/log/deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    error "Please run as non-root user with sudo privileges"
fi

# Create backup
create_backup() {
    log "Creating backup..."
    sudo mkdir -p "$BACKUP_DIR/$(date +%Y%m%d_%H%M%S)"
    
    # Backup database
    if docker ps | grep -q factory-mongodb; then
        sudo docker exec factory-mongodb mongodump --out /backup
        sudo cp -r /tmp/backup "$BACKUP_DIR/$(date +%Y%m%d_%H%M%S)/database"
    fi
    
    # Backup configuration
    sudo cp -r .env* docker-compose*.yml "$BACKUP_DIR/$(date +%Y%m%d_%H%M%S)/config"
    success "Backup created at $BACKUP_DIR/$(date +%Y%m%d_%H%M%S)"
}

# Update code
update_code() {
    log "Updating code..."
    cd "$PROJECT_DIR"
    git pull origin main
    success "Code updated"
}

# Build and deploy
deploy() {
    log "Starting deployment for $ENVIRONMENT environment..."
    
    case $ENVIRONMENT in
        "development")
            log "Deploying to development..."
            docker-compose down
            docker-compose up --build -d
            ;;
        "production")
            log "Deploying to production..."
            sudo docker-compose -f docker-compose.prod.yml down
            sudo docker-compose -f docker-compose.prod.yml pull
            sudo docker-compose -f docker-compose.prod.yml up -d
            ;;
        *)
            error "Invalid environment. Use 'development' or 'production'"
            ;;
    esac
}

# Health check
health_check() {
    log "Performing health checks..."
    sleep 30
    
    # Check frontend
    if curl -f http://localhost:80/health > /dev/null 2>&1; then
        success "Frontend health check passed"
    else
        error "Frontend health check failed"
    fi
    
    # Check backend
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        success "Backend health check passed"
    else
        error "Backend health check failed"
    fi
}

# Cleanup
cleanup() {
    log "Cleaning up..."
    docker system prune -f
    success "Cleanup completed"
}

# Main deployment flow
main() {
    log "Starting deployment process..."
    
    create_backup
    update_code
    deploy
    health_check
    cleanup
    
    success "Deployment completed successfully!"
    log "Application is running at:"
    if [ "$ENVIRONMENT" = "production" ]; then
        log "Frontend: https://yourdomain.com"
        log "Backend: https://yourdomain.com/api"
    else
        log "Frontend: http://localhost:80"
        log "Backend: http://localhost:3001"
    fi
}

# Run main function
main
