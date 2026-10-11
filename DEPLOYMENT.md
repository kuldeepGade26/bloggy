# Production Deployment Guide: Bloggy on Linux with Apache2 & PM2

This guide walks you through deploying **Bloggy** (React Vite + Node Express + PostgreSQL) on a self-hosted Ubuntu/Debian Linux server behind an **Apache2** reverse proxy.

---

## 1. Server Prerequisites

On your self-hosted Linux machine:

```bash
# Update repositories
sudo apt update && sudo apt upgrade -y

# Install Node.js (v20+ LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL & Apache2
sudo apt install -y postgresql postgresql-contrib apache2

# Install PM2 process manager globally
sudo npm install -g pm2
```

---

## 2. PostgreSQL Setup

Create the database and application user:

```bash
# Log in as postgres superuser
sudo -u postgres psql

# Run SQL commands:
CREATE DATABASE bloggy_db;
CREATE USER bloggy_user WITH ENCRYPTED PASSWORD 'YourSuperSecurePassword123!';
GRANT ALL PRIVILEGES ON DATABASE bloggy_db TO bloggy_user;
\q
```

### Apply Schema and Seed Data:
```bash
# Clone or copy project to /var/www/bloggy
cd /var/www/bloggy/backend

# Run schema and seed
PGPASSWORD='YourSuperSecurePassword123!' psql -U bloggy_user -d bloggy_db -h localhost -f database/schema.sql
PGPASSWORD='YourSuperSecurePassword123!' psql -U bloggy_user -d bloggy_db -h localhost -f database/seed.sql
```

---

## 3. Backend Setup & PM2 Process Supervision

### Configure Backend Environment:
```bash
cd /var/www/bloggy/backend
npm install --production

# Create production .env
cat <<EOF > .env
PORT=5000
NODE_ENV=production
JWT_SECRET=$(openssl rand -hex 32)
DATABASE_URL=postgresql://bloggy_user:YourSuperSecurePassword123!@localhost:5432/bloggy_db
CLIENT_ORIGIN=https://bloggy.yourdomain.com
EOF

# Ensure uploads folder has write permissions
mkdir -p uploads
sudo chown -R www-data:www-data uploads
chmod -R 775 uploads
```

### Start Backend with PM2:
```bash
cd /var/www/bloggy
pm2 start ecosystem.config.js --env production

# Ensure PM2 starts automatically on system reboot
pm2 save
pm2 startup
```

---

## 4. Frontend Build

Build the static React SPA:

```bash
cd /var/www/bloggy/frontend
npm install
npm run build

# Ensure web server can read frontend/dist
sudo chown -R www-data:www-data /var/www/bloggy/frontend/dist
sudo chmod -R 755 /var/www/bloggy/frontend/dist
```

---

## 5. Apache2 Configuration

### Enable Required Apache Modules:
```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod headers
sudo a2enmod rewrite
sudo a2enmod deflate
```

### Copy and Enable VirtualHost Configuration:
```bash
sudo cp /var/www/bloggy/deploy/apache2-bloggy.conf /etc/apache2/sites-available/bloggy.conf

# Adjust domain name in /etc/apache2/sites-available/bloggy.conf:
# ServerName yourdomain.com

# Enable site and test syntax
sudo a2ensite bloggy.conf
sudo apache2ctl configtest

# Restart Apache
sudo systemctl restart apache2
```

---

## 6. Free HTTPS SSL Certificate (Certbot)

```bash
sudo apt install -y certbot python3-certbot-apache
sudo certbot --apache -d bloggy.yourdomain.com
```

Certbot will automatically install SSL certificates and configure HTTPS redirects.

---

## 7. Default Credentials & Management

- **Admin Account**: `admin@bloggy.local` / `adminpassword123`
- **Reader Account**: `reader@bloggy.local` / `adminpassword123`
- **PM2 Dashboard**: `pm2 status` or `pm2 monit`
- **Backend Logs**: `pm2 logs bloggy-backend`
- **Apache Logs**: `/var/log/apache2/bloggy_error.log`
