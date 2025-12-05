#!/bin/bash

# Server setup script for Pura Vida Recovery Homes
# This script sets up the server environment for the first time

set -e

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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   log_error "This script should not be run as root. Use sudo when needed."
   exit 1
fi

log_info "Starting server setup for Pura Vida Recovery Homes"

# Update system
log_info "Updating system packages..."
sudo apt update && sudo apt upgrade -y
log_success "System updated"

# Install required packages
log_info "Installing required packages..."
sudo apt install -y nginx curl wget unzip htpasswd ufw fail2ban logrotate openssl
log_success "Required packages installed"

# Create necessary directories
log_info "Creating necessary directories..."
sudo mkdir -p /var/www
sudo mkdir -p /var/backups/web
sudo mkdir -p /etc/ssl/certs
sudo mkdir -p /etc/ssl/private
sudo mkdir -p /var/log/nginx
log_success "Directories created"

# Configure firewall
log_info "Configuring firewall..."
sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
log_success "Firewall configured"

# Start and enable Nginx
log_info "Configuring Nginx..."
sudo systemctl start nginx
sudo systemctl enable nginx
log_success "Nginx configured and started"

# Remove default Nginx site
if [[ -f "/etc/nginx/sites-enabled/default" ]]; then
    log_info "Removing default Nginx site..."
    sudo rm -f /etc/nginx/sites-enabled/default
    log_success "Default site removed"
fi

# Create staging basic auth user
log_info "Setting up staging authentication..."
echo "Please enter a password for the staging environment:"
sudo htpasswd -c /etc/nginx/.htpasswd staging
log_success "Staging authentication configured"

# Generate self-signed certificate for staging
log_info "Generating self-signed SSL certificate for staging..."
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/staging.puravidarecoveryhomes.com.key \
  -out /etc/ssl/certs/staging.puravidarecoveryhomes.com.pem \
  -subj "/C=CR/ST=SanJose/L=SanJose/O=PuraVidaRecovery/CN=staging.puravidarecoveryhomes.com"
log_success "Self-signed certificate generated for staging"

# Set proper permissions for SSL files
sudo chmod 600 /etc/ssl/private/staging.puravidarecoveryhomes.com.key
sudo chmod 644 /etc/ssl/certs/staging.puravidarecoveryhomes.com.pem
sudo chown root:root /etc/ssl/private/staging.puravidarecoveryhomes.com.key
sudo chown root:root /etc/ssl/certs/staging.puravidarecoveryhomes.com.pem

# Configure fail2ban for nginx
log_info "Configuring fail2ban for Nginx..."
sudo tee /etc/fail2ban/jail.local > /dev/null <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/*error.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/*error.log
maxretry = 10

[nginx-botsearch]
enabled = true
port = http,https
logpath = /var/log/nginx/*access.log
maxretry = 2
EOF

sudo systemctl restart fail2ban
sudo systemctl enable fail2ban
log_success "fail2ban configured"

# Create deploy user and SSH setup
log_info "Setting up deployment user..."
if ! id "deploy" &>/dev/null; then
    sudo useradd -m -s /bin/bash deploy
    sudo usermod -aG www-data deploy
    log_success "Deploy user created"
else
    log_info "Deploy user already exists"
fi

# Set up SSH directory for deploy user
sudo mkdir -p /home/deploy/.ssh
sudo chown deploy:deploy /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh

# Create deployment directory structure
sudo mkdir -p /home/deploy/deployments
sudo chown deploy:deploy /home/deploy/deployments

# Add deploy user to sudoers for specific commands
sudo tee /etc/sudoers.d/deploy > /dev/null <<EOF
deploy ALL=(ALL) NOPASSWD: /usr/sbin/nginx, /bin/systemctl reload nginx, /bin/systemctl restart nginx, /bin/cp, /bin/mkdir, /bin/chown, /bin/chmod, /bin/ln, /bin/rm
EOF

log_success "Deploy user configured"

# Set up log rotation for custom logs
log_info "Setting up log rotation..."
sudo tee /etc/logrotate.d/puravidarecoveryhomes > /dev/null <<EOF
/var/log/nginx/*puravidarecoveryhomes.com*.log {
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
log_success "Log rotation configured"

# Create backup script
log_info "Creating backup script..."
sudo tee /usr/local/bin/backup-website.sh > /dev/null <<'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/web"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

for site in /var/www/*/; do
    if [[ -d "$site" ]]; then
        site_name=$(basename "$site")
        backup_path="$BACKUP_DIR/${site_name}_${TIMESTAMP}"
        mkdir -p "$backup_path"
        cp -r "$site"* "$backup_path/" 2>/dev/null || true
        echo "Backup created: $backup_path"
    fi
done

# Clean old backups (keep 30 days)
find "$BACKUP_DIR" -name "*_20*" -type d -mtime +30 -exec rm -rf {} + 2>/dev/null || true
EOF

sudo chmod +x /usr/local/bin/backup-website.sh

# Set up daily backup cron job
(sudo crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-website.sh") | sudo crontab -
log_success "Backup system configured"

# Create SSL certificate directories with proper permissions
sudo chown root:root /etc/ssl/certs /etc/ssl/private
sudo chmod 755 /etc/ssl/certs
sudo chmod 700 /etc/ssl/private

# Test Nginx configuration
log_info "Testing Nginx configuration..."
if sudo nginx -t; then
    log_success "Nginx configuration is valid"
    sudo systemctl reload nginx
else
    log_error "Nginx configuration has errors"
fi

# Display summary
echo -e "\n${GREEN}=== SERVER SETUP COMPLETE ===${NC}"
echo -e "\n${BLUE}What was installed and configured:${NC}"
echo "✓ Nginx web server"
echo "✓ UFW firewall (ports 22, 80, 443 open)"
echo "✓ fail2ban intrusion prevention"
echo "✓ SSL certificate for staging environment"
echo "✓ Basic authentication for staging"
echo "✓ Deploy user with limited sudo permissions"
echo "✓ Log rotation for website logs"
echo "✓ Daily backup system"
echo "✓ Required directories and permissions"

echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Copy your production SSL certificates to:"
echo "   /etc/ssl/certs/puravidarecoveryhomes.com.pem"
echo "   /etc/ssl/private/puravidarecoveryhomes.com.key"
echo ""
echo "2. Add the deploy user's public key to GitHub Secrets:"
echo "   cat /home/deploy/.ssh/id_rsa.pub"
echo ""
echo "3. Configure your GitHub repository secrets:"
echo "   - HOST_STAGING: $(curl -s ifconfig.me)"
echo "   - HOST_PRODUCTION: $(curl -s ifconfig.me)"
echo "   - USERNAME: deploy"
echo "   - SSH_KEY: (private key content)"
echo ""
echo "4. Set up Cloudflare DNS records pointing to: $(curl -s ifconfig.me)"
echo ""
echo "5. Test the deployment by running:"
echo "   ./deploy.sh staging"

echo -e "\n${GREEN}Server is ready for deployment!${NC}"