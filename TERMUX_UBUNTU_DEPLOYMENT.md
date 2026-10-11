# 📱 Complete Guide: Deploying Bloggy on Ubuntu PRoot-Distro in Termux (Android)

This guide shows you how to run and deploy **Bloggy** (React Frontend + Node.js Express Backend + Apache2 / Reverse Proxy) directly on your Android phone using **Termux** and **Ubuntu PRoot-Distro**.

---

## ⚡ Important Termux / PRoot Technical Constraints
1. **Unprivileged Ports (> 1024)**: Non-rooted Android devices do not allow binding to port `80` or `443`. We configure Apache2 and the application to run on ports **`8080`** (or `8000`) and **`5000`**.
2. **No Native Systemd**: PRoot is a user-space container without `systemd`. We manage services directly or via commands and PM2.
3. **Android Battery Optimization**: Use Termux `termux-wake-lock` so Android does not sleep or kill your server processes when the screen is off.

---

## Step 1: Install Termux & Prepare Environment

> [!IMPORTANT]
> Install Termux from **F-Droid** or GitHub releases. Do NOT use Google Play Store (the Play Store build is deprecated and has broken repositories).

Open Termux on your phone and run:

```bash
# 1. Update Termux core packages
pkg update && pkg upgrade -y

# 2. Grant Termux storage permission
termux-setup-storage

# 3. Prevent Android from sleeping the background process
termux-wake-lock

# 4. Install PRoot Distro, Git, and utilities
pkg install proot-distro git curl nano -y
```

---

## Step 2: Install and Enter Ubuntu PRoot

```bash
# Install Ubuntu image
proot-distro install ubuntu

# Log into Ubuntu environment
proot-distro login ubuntu
```

You are now inside an authentic Ubuntu Linux environment running on your phone!

---

## Step 3: Install Node.js, Apache2 & Dependencies in Ubuntu

Inside the Ubuntu PRoot shell:

```bash
# Update Ubuntu package indices
apt update && apt upgrade -y

# Install Node.js, npm, Apache2, and build tools
apt install -y nodejs npm apache2 git curl build-essential

# Verify versions
node -v
npm -v
apache2 -v
```

---

## Step 4: Copy or Clone Bloggy into Ubuntu

You can clone from your Git repository or copy from your phone's internal storage (`/sdcard`):

```bash
# Create directory
mkdir -p /var/www/bloggy
cd /var/www/bloggy

# Option A: If cloning from Git
# git clone <your-repo-url> .

# Option B: Or copy directly from internal storage (Termux shared folder):
# cp -r /sdcard/bloggy/* /var/www/bloggy/
```

---

## Step 5: Install & Build Backend & Frontend

### 1. Setup Backend:
```bash
cd /var/www/bloggy/backend
npm install

# Create/verify production .env
cat <<EOF > .env
PORT=5000
NODE_ENV=production
JWT_SECRET=cozy_termux_mobile_super_secret_key_2025!
CLIENT_ORIGIN=*
EOF

# Ensure uploads directory exists
mkdir -p uploads
```

> **Note on Database**: Bloggy comes equipped with an integrated zero-setup local storage engine (`backend/data/dev_store.json`), which works out-of-the-box in PRoot without needing to configure complex background Postgres daemon privileges! If you want PostgreSQL in PRoot, you can install `postgresql` and initialize clusters with `su - postgres -c "/usr/lib/postgresql/16/bin/pg_ctl -D /var/lib/postgresql/16/main start"`.

### 2. Setup & Build Frontend:
```bash
cd /var/www/bloggy/frontend
npm install
npm run build
```

The production React assets are compiled into `/var/www/bloggy/frontend/dist`.

---

## Step 6: Configure Apache2 for Mobile (Port 8080)

Because Android prohibits port 80 for non-root users, configure Apache2 to listen on **Port 8080**:

### 1. Change Apache listening port:
Edit `/etc/apache2/ports.conf`:
```bash
sed -i 's/Listen 80/Listen 8080/' /etc/apache2/ports.conf
```

### 2. Enable Required Apache Modules:
```bash
a2enmod proxy
a2enmod proxy_http
a2enmod headers
a2enmod rewrite
a2enmod deflate
```

### 3. Create the Mobile VirtualHost:
Create `/etc/apache2/sites-available/bloggy-termux.conf`:

```apache
<VirtualHost *:8080>
    ServerName localhost
    DocumentRoot /var/www/bloggy/frontend/dist

    <Directory /var/www/bloggy/frontend/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        FallbackResource /index.html
    </Directory>

    ProxyRequests Off
    ProxyPreserveHost On

    ProxyPass /api http://127.0.0.1:5000/api retry=0 timeout=60
    ProxyPassReverse /api http://127.0.0.1:5000/api

    ProxyPass /uploads http://127.0.0.1:5000/uploads retry=0 timeout=60
    ProxyPassReverse /uploads http://127.0.0.1:5000/uploads
</VirtualHost>
```

### 4. Enable the site and start Apache:
```bash
a2dissite 000-default.conf
a2ensite bloggy-termux.conf
apache2ctl start
```

---

## Step 7: Run the Backend with PM2

Install PM2 globally inside Ubuntu to keep the Node backend running in the background:

```bash
npm install -g pm2

cd /var/www/bloggy
pm2 start backend/server.js --name "bloggy-api"
```

---

## Step 8: Access the Website on Your Phone!

Open **Chrome**, **Firefox**, or **Brave** on your Android phone and navigate to:

👉 **`http://localhost:8080`**

### Access from other PCs / devices on your Wi-Fi:
1. Find your phone's Wi-Fi IP address in Android Settings (e.g., `192.168.1.45`) or run `ip addr` in Termux.
2. On your laptop/tablet, visit:
   👉 **`http://192.168.1.45:8080`**

---

## 🛠️ Quick Daily Start Script

Create a start script in Ubuntu (`/root/start-bloggy.sh`):

```bash
#!/bin/bash
apache2ctl start
pm2 start /var/www/bloggy/backend/server.js --name "bloggy-api"
echo "🌸 Bloggy is running at http://localhost:8080"
```

Make it executable:
```bash
chmod +x /root/start-bloggy.sh
```

Whenever you open Termux, just run:
```bash
proot-distro login ubuntu -- /root/start-bloggy.sh
```
