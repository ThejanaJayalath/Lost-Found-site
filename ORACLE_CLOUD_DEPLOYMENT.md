# Oracle Cloud Free Tier Deployment Guide
## Deploy Spring Boot Backend with Zero Cold Starts

This guide will help you deploy your `lost-and-found-lk-backend` Spring Boot application to Oracle Cloud Infrastructure (OCI) Free Tier with an **always-on** compute instance (no cold starts).

---

## 📋 Prerequisites

- [ ] Oracle Cloud account (sign up at [cloud.oracle.com](https://cloud.oracle.com))
- [ ] Your Spring Boot backend code
- [ ] MongoDB Atlas connection (already configured)
- [ ] SSH client (PuTTY for Windows or built-in SSH)

---

## 🎯 What You'll Get (Free Tier)

- **4 Arm-based Ampere A1 cores** (24 GB RAM total) - Always Free ⭐ **RECOMMENDED**
- **OR 2 AMD-based Compute VMs** (1/8 OCPU, 1 GB RAM each) - Always Free
- **200 GB Block Storage** - Always Free
- **10 TB Outbound Data Transfer/month** - Always Free
- **No cold starts** - Your app runs 24/7

> [!TIP]
> Use the **Ampere A1 (ARM)** instance for better performance. You can create 1 VM with 4 cores and 24GB RAM.

---

## 📝 Step-by-Step Deployment

### Step 1: Create a Compute Instance (VM)

1. **Login to Oracle Cloud Console** ([cloud.oracle.com](https://cloud.oracle.com))
2. **Navigate to Compute Instances**
   - Menu (☰) → **Compute** → **Instances**
   - Click **"Create Instance"**

3. **Configure Instance Settings**
   - **Name:** `lost-found-backend-vm`
   - **Image:** Click "Change Image" → Select **"Canonical Ubuntu"** (22.04 or 24.04)
   - **Shape:** Click "Change Shape" → Select **"Ampere"** (VM.Standard.A1.Flex)
     - OCPU count: 2 (or 4)
     - Memory: 12 GB (or 24 GB)

   - **Networking:**
     - Create new virtual cloud network (or select existing)
     - **Assign a public IPv4 address**: Yes ✅

   - **Add SSH Keys:**
     - Select **"Generate a key pair for me"**
     - **Save Private Key** (Download `ssh-key.key`) - **IMPORTANT!**

   - Click **"Create"** and wait for it to run.

4. **Copy Public IP:** Note down the Public IP address (e.g., `123.45.67.89`).

---

### Step 2: Configure Firewall Rules (Security List)

1. On the Instance details page, click the **Subnet** link (under Primary VNIC).
2. Click **"Default Security List"**.
3. Click **"Add Ingress Rules"**:
   - **Source CIDR:** `0.0.0.0/0`
   - **IP Protocol:** TCP
   - **Destination Port Range:** `80, 443, 8082`
   - **Description:** HTTP, HTTPS, Spring Boot
4. Click **"Add Ingress Rules"**.

---

### Step 3: Connect via SSH

**On Windows (PowerShell):**
```powershell
# Go to folder with key
cd Downloads

# Set permissions (if needed, or just try connecting)
# Connect
ssh -i ssh-key.key ubuntu@YOUR_PUBLIC_IP
```
*(Type `yes` if asked about fingerprint)*

---

### Step 4: Install Java 21

On the server (SSH session):
```bash
sudo apt update
sudo apt install openjdk-21-jdk -y
java -version
# Should show openjdk version "21..."
```

---

### Step 5: Configure Server Firewall (UFW)

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8082/tcp
sudo ufw enable
# Type 'y' to confirm
```

---

### Step 6: Build and Upload Application

**On your Local Machine:**

1. **Build JAR:**
   ```powershell
   cd C:\Lost-Found-site\lost-and-found-lk-backend
   .\mvnw.cmd clean package -DskipTests
   ```
   *(File created at `target/lost-and-found-lk-backend-0.0.1-SNAPSHOT.jar`)*

2. **Upload JAR:**
   ```powershell
   scp -i path/to/ssh-key.key target/lost-and-found-lk-backend-0.0.1-SNAPSHOT.jar ubuntu@YOUR_PUBLIC_IP:/home/ubuntu/app.jar
   ```

---

### Step 7: Run Application on Server

**On the Server:**

1. **Create Production Config:**
   ```bash
   nano application-prod.properties
   ```
   **Paste this content:**
   ```properties
   spring.application.name=lost-and-found-lk-backend
   # Use standard connection string for Production
   spring.data.mongodb.uri=mongodb+srv://todoListApp:sinhalanews@cluster0.gdcsnzk.mongodb.net/lost_and_found?retryWrites=true&w=majority
   
   jwt.secret=5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437
   jwt.access.ttl=15m
   jwt.refresh.ttl=7d
   
   # Update this with your actual frontend domain/IP later
   app.cors.allowedOrigins=*
   server.port=8082
   ```
   *(Save: Ctrl+O, Enter, Ctrl+X)*

2. **Create Systemd Service (Auto-start):**
   ```bash
   sudo nano /etc/systemd/system/lostfound.service
   ```
   **Content:**
   ```ini
   [Unit]
   Description=Lost Found Backend
   After=network.target

   [Service]
   User=ubuntu
   WorkingDirectory=/home/ubuntu
   ExecStart=/usr/bin/java -jar -Dspring.config.location=/home/ubuntu/application-prod.properties /home/ubuntu/app.jar
   SuccessExitStatus=143
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```

3. **Start Service:**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable lostfound
   sudo systemctl start lostfound
   sudo systemctl status lostfound
   ```

---

### Step 8: Verify

Check logs:
```bash
journalctl -u lostfound -f
```

Test API:
Open browser: `http://YOUR_PUBLIC_IP:8082/api/posts`

---

### Troubleshooting

- **MongoDB Error?** Ensure MongoDB Atlas Network Access allows your Oracle Cloud IP (or `0.0.0.0/0`).
- **Connection Refused?** Check Security List (Step 2) and UFW (Step 5).
