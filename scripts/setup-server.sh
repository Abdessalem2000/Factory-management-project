#!/bin/bash

# Factory Management Platform - Server Setup Script
# Run this on a fresh server to prepare for deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root"
fi

log "Starting server setup for Factory Management Platform..."

# Update system
log "Updating system packages..."
apt update && apt upgrade -y

# Install required packages
log "Installing required packages..."
apt install -y \
    curl \
    wget \
    git \
    nginx \
    certbot \
    python3-certbot-nginx \
    docker.io \
    docker-compose \
    ufw \
    htop \
    vim

# Start and enable services
log "Configuring services..."
systemctl start docker
systemctl enable docker
systemctl start nginx
systemctl enable nginx

# Create application user
log "Creating application user..."
if ! id "factory" &>/dev/null; then
    useradd -m -s /bin/bash factory
    usermod -aG docker factory
    success "User 'factory' created"
else
    warning "User 'factory' already exists"
fi

# Create directories
log "Creating application directories..."
mkdir -p /opt/factory-management-platform
mkdir -p /opt/backups/factory-platform
mkdir -p /var/log/factory-platform
mkdir -p /opt/ssl

# Set permissions
chown -R factory:factory /opt/factory-management-platform
chown -R factory:factory /opt/backups/factory-platform
chown -R factory:factory /var/log/factory-platform
chown -R factory:factory /opt/ssl

# Configure firewall
log "Configuring firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Setup swap space
log "Configuring swap space..."
if ! grep -q "/swapfile" /etc/fstab; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    success "Swap space configured"
else
    warning "Swap space already configured"
fi

# Optimize system
log "Optimizing system settings..."
echo 'vm.swappiness=10' >> /etc/sysctl.conf
echo 'vm.vfs_cache_pressure=50' >> /etc/sysctl.conf
sysctl -p

# Clone repository (or create placeholder)
log "Setting up application directory..."
cd /opt/factory-management-platform
if [ ! -d ".git" ]; then
    # Create placeholder for manual setup
    mkdir -p backend frontend nginx scripts
    success "Application directory structure created"
else
    success "Repository already exists"
fi

# Create logrotate configuration
log "Setting up log rotation..."
cat > /etc/logrotate.d/factory-platform << EOF
/var/log/factory-platform/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 factory factory
    postrotate
        systemctl reload nginx
    endscript
}
EOF

# Create systemd service for auto-deployment
log "Creating systemd service..."
cat > /etc/systemd/system/factory-platform.service << EOF
[Unit]
Description=Factory Management Platform
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/factory-management-platform
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0
User=factory
Group=factory

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable factory-platform.service

# Setup SSL certificate (Let's Encrypt)
log "Setting up SSL preparation..."
echo "Note: SSL certificates will be configured after domain is pointed to this server"
echo "Run: certbot --nginx -d yourdomain.com after DNS setup"

# Display setup summary
success "Server setup completed!"
echo ""
echo -e "${GREEN}=== Setup Summary ===${NC}"
echo "✅ System packages installed"
echo "✅ Docker and Docker Compose configured"
echo "✅ Nginx configured"
echo "✅ Firewall configured"
echo "✅ Application user created"
echo "✅ Directories created"
echo "✅ Log rotation configured"
echo "✅ Systemd service created"
echo ""
echo -e "${YELLOW}=== Next Steps ===${NC}"
echo "1. Switch to factory user: su - factory"
echo "2. Clone your repository: cd /opt/factory-management-platform && git clone <your-repo> ."
echo "3. Configure environment: cp .env.production.example .env.production"
echo "4. Deploy application: ./scripts/deploy.sh production"
echo "5. Setup SSL: certbot --nginx -d yourdomain.com"
echo ""
echo -e "${BLUE}=== Important Information ===${NC}"
echo "Application directory: /opt/factory-management-platform"
echo "Backup directory: /opt/backups/factory-platform"
echo "Log directory: /var/log/factory-platform"
echo "SSL directory: /opt/ssl"
echo ""
echo -e "${GREEN}Server is ready for deployment!${NC}"
