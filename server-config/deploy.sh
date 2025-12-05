#!/bin/bash

# Deploy script for Pura Vida Recovery Homes
# This script handles the deployment process on the server

set -e  # Exit on any error

# Configuration
ENVIRONMENT=${1:-staging}
PROJECT_NAME="puravidarecoveryhomes"
WEB_ROOT="/var/www"
BACKUP_DIR="/var/backups/web"
NGINX_CONFIG_DIR="/etc/nginx/sites-available"
NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    log_error "Invalid environment. Use 'staging' or 'production'"
    exit 1
fi

# Set environment-specific variables
if [[ "$ENVIRONMENT" == "production" ]]; then
    DOMAIN="puravidarecoveryhomes.com"
    BUILD_DIR="dist"
else
    DOMAIN="staging.puravidarecoveryhomes.com"
    BUILD_DIR="dist"
fi

SITE_ROOT="$WEB_ROOT/$DOMAIN"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_PATH="$BACKUP_DIR/${DOMAIN}_${TIMESTAMP}"

log_info "Starting deployment for $ENVIRONMENT environment"
log_info "Domain: $DOMAIN"
log_info "Site root: $SITE_ROOT"

# Create necessary directories
log_info "Creating necessary directories..."
sudo mkdir -p "$WEB_ROOT"
sudo mkdir -p "$BACKUP_DIR"
sudo mkdir -p "/var/log/nginx"

# Create backup of current site (if it exists)
if [[ -d "$SITE_ROOT" ]]; then
    log_info "Creating backup of current site..."
    sudo mkdir -p "$BACKUP_PATH"
    sudo cp -r "$SITE_ROOT"/* "$BACKUP_PATH/" 2>/dev/null || log_warning "No files to backup"
    log_success "Backup created at $BACKUP_PATH"
fi

# Create site directory
log_info "Preparing site directory..."
sudo mkdir -p "$SITE_ROOT"
sudo chown -R www-data:www-data "$SITE_ROOT"
sudo chmod -R 755 "$SITE_ROOT"

# Copy new files (assuming they are in the current directory)
if [[ -d "$BUILD_DIR" ]]; then
    log_info "Deploying new files from $BUILD_DIR..."
    sudo cp -r "$BUILD_DIR"/* "$SITE_ROOT/"
    sudo chown -R www-data:www-data "$SITE_ROOT"
    sudo chmod -R 644 "$SITE_ROOT"
    sudo find "$SITE_ROOT" -type d -exec chmod 755 {} \;
    log_success "Files deployed successfully"
else
    log_error "Build directory $BUILD_DIR not found"
    exit 1
fi

# Setup Nginx configuration
NGINX_CONFIG="nginx-${ENVIRONMENT}.conf"
if [[ -f "$NGINX_CONFIG" ]]; then
    log_info "Setting up Nginx configuration..."
    
    # Copy configuration file
    sudo cp "$NGINX_CONFIG" "$NGINX_CONFIG_DIR/$DOMAIN"
    
    # Update certificate paths in the config (placeholder replacement)
    if [[ "$ENVIRONMENT" == "production" ]]; then
        sudo sed -i "s|/path/to/your/certificate.pem|/etc/ssl/certs/${DOMAIN}.pem|g" "$NGINX_CONFIG_DIR/$DOMAIN"
        sudo sed -i "s|/path/to/your/private.key|/etc/ssl/private/${DOMAIN}.key|g" "$NGINX_CONFIG_DIR/$DOMAIN"
    else
        sudo sed -i "s|/path/to/your/staging-certificate.pem|/etc/ssl/certs/staging.${DOMAIN}.pem|g" "$NGINX_CONFIG_DIR/$DOMAIN"
        sudo sed -i "s|/path/to/your/staging-private.key|/etc/ssl/private/staging.${DOMAIN}.key|g" "$NGINX_CONFIG_DIR/$DOMAIN"
    fi
    
    # Enable site
    sudo ln -sf "$NGINX_CONFIG_DIR/$DOMAIN" "$NGINX_ENABLED_DIR/$DOMAIN"
    
    log_success "Nginx configuration updated"
else
    log_warning "Nginx configuration file $NGINX_CONFIG not found"
fi

# Test Nginx configuration
log_info "Testing Nginx configuration..."
if sudo nginx -t; then
    log_success "Nginx configuration test passed"
    
    # Reload Nginx
    log_info "Reloading Nginx..."
    sudo systemctl reload nginx
    log_success "Nginx reloaded successfully"
else
    log_error "Nginx configuration test failed"
    
    # Rollback if there's a backup
    if [[ -d "$BACKUP_PATH" ]]; then
        log_warning "Rolling back to previous version..."
        sudo rm -rf "$SITE_ROOT"/*
        sudo cp -r "$BACKUP_PATH"/* "$SITE_ROOT/"
        sudo chown -R www-data:www-data "$SITE_ROOT"
        log_info "Rollback completed"
    fi
    exit 1
fi

# Create basic auth file for staging if it doesn't exist
if [[ "$ENVIRONMENT" == "staging" ]] && [[ ! -f "/etc/nginx/.htpasswd" ]]; then
    log_info "Creating basic auth for staging environment..."
    log_warning "Please run: sudo htpasswd -c /etc/nginx/.htpasswd staging"
    log_warning "And set a password for the staging environment"
fi

# Set up log rotation
log_info "Setting up log rotation..."
sudo tee "/etc/logrotate.d/${DOMAIN}" > /dev/null <<EOF
/var/log/nginx/${DOMAIN}_access.log /var/log/nginx/${DOMAIN}_error.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 \$(cat /var/run/nginx.pid)
        fi
    endscript
}
EOF

# Clean up old backups (keep last 7 days)
log_info "Cleaning up old backups..."
find "$BACKUP_DIR" -name "${DOMAIN}_*" -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true

# Final checks
log_info "Performing final checks..."

# Check if site is accessible
if curl -s -o /dev/null -w "%{http_code}" "http://localhost" -H "Host: $DOMAIN" | grep -q "200\|301\|302"; then
    log_success "Site is responding correctly"
else
    log_warning "Site may not be responding correctly. Please check manually."
fi

# Display deployment summary
echo -e "\n${GREEN}=== DEPLOYMENT SUMMARY ===${NC}"
echo -e "Environment: ${BLUE}$ENVIRONMENT${NC}"
echo -e "Domain: ${BLUE}$DOMAIN${NC}"
echo -e "Site root: ${BLUE}$SITE_ROOT${NC}"
echo -e "Backup location: ${BLUE}$BACKUP_PATH${NC}"
echo -e "Nginx config: ${BLUE}$NGINX_CONFIG_DIR/$DOMAIN${NC}"
echo -e "Deployment time: ${BLUE}$(date)${NC}"

log_success "Deployment completed successfully!"

# Next steps recommendations
echo -e "\n${YELLOW}=== NEXT STEPS ===${NC}"
if [[ "$ENVIRONMENT" == "production" ]]; then
    echo "1. Verify SSL certificates are properly configured"
    echo "2. Test the site: https://$DOMAIN"
    echo "3. Monitor logs: tail -f /var/log/nginx/${DOMAIN}_*.log"
    echo "4. Update DNS if necessary"
else
    echo "1. Set up basic auth: sudo htpasswd -c /etc/nginx/.htpasswd staging"
    echo "2. Test the staging site: https://$DOMAIN"
    echo "3. Verify SSL certificate (can be self-signed for staging)"
    echo "4. Monitor logs: tail -f /var/log/nginx/${DOMAIN}_*.log"
fi

echo -e "\n${GREEN}Deployment completed at $(date)${NC}"