# 🎫 IT Incidents Management System

A full-stack web application for managing IT support tickets with role-based access control, built with **Spring Boot**, **React**, and **PostgreSQL**.

[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://github.com/salaheddinbenhammich/security_project/pkgs/container/it-incidents-backend)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start with Docker (Recommended)](#-quick-start-with-docker-recommended)
  - [Prerequisites](#prerequisites)
  - [Docker Installation](#docker-installation)
  - [Deploy with Pre-built Images](#deploy-with-pre-built-images)
- [Manual Deployment (Optional)](#-manual-deployment-optional)
- [Demo Users](#-demo-users)
- [API Documentation](#-api-documentation)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

- 🔐 **Secure Authentication** with JWT tokens and refresh tokens
- 👥 **Role-Based Access Control** (Admin & User)
- 🎫 **Ticket Management** with status tracking (Pending, In Progress, Resolved, Closed, Cancelled)
- 💬 **Comments System** with internal notes for admins
- 🔒 **Advanced Security Features**:
  - Password expiration (90 days)
  - Account lockout after failed attempts
  - Password strength requirements
- 📊 **Admin Dashboard** with statistics and user management
- 🔍 **Search & Filter** tickets by status, priority, category
- 📱 **Responsive Design** with modern UI

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, TailwindCSS, Shadcn/ui |
| **Backend** | Spring Boot 4.0.2, Java 17 |
| **Database** | PostgreSQL 16 |
| **Authentication** | JWT (JSON Web Tokens) |
| **Deployment** | Docker, Docker Compose |

---

## 🚀 Quick Start with Docker (Recommended)

### Prerequisites

- **Docker** and **Docker Compose** installed
- **8GB RAM** minimum
- Ports **80**, **8080**, and **5432** available

---

### Docker Installation

<details>
<summary><b>🐧 Ubuntu / Debian</b></summary>

```bash
# Update package index
sudo apt update

# Install prerequisites
sudo apt install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up the repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add your user to docker group (to run without sudo)
sudo usermod -aG docker $USER

# Apply group changes (or logout/login)
newgrp docker

# Verify installation
docker --version
docker compose version
```

**Start Docker service:**
```bash
sudo systemctl start docker
sudo systemctl enable docker
```

</details>

<details>
<summary><b>🎩 Kali Linux</b></summary>

```bash
# Update package index
sudo apt update

# Install prerequisites
sudo apt install -y ca-certificates curl gnupg

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Set up the repository (Kali is based on Debian)
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  bullseye stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add your user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker compose version
```

**Start Docker service:**
```bash
sudo systemctl start docker
sudo systemctl enable docker
```

</details>

<details>
<summary><b>📦 Debian</b></summary>

```bash
# Update package index
sudo apt update

# Install prerequisites
sudo apt install -y ca-certificates curl gnupg

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Set up the repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add your user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker compose version
```

**Start Docker service:**
```bash
sudo systemctl start docker
sudo systemctl enable docker
```

</details>

---

### Deploy with Pre-built Images

This is the fastest way to deploy - uses pre-built images from GitHub Container Registry.

#### Step 1: Clone the Repository

```bash
# Clone the project
git clone https://github.com/salaheddinbenhammich/security_project.git

# Navigate to project directory
cd security_project
```

#### Step 2: Pull the Latest Docker Images

```bash
# Pull pre-built images from GitHub Container Registry
docker compose -f docker-compose.prod.yml pull
```

This will download:
- `ghcr.io/salaheddinbenhammich/it-incidents-backend:latest`
- `ghcr.io/salaheddinbenhammich/it-incidents-frontend:latest`
- `postgres:16-alpine`

#### Step 3: Start All Services

```bash
# Start all containers in detached mode
docker compose -f docker-compose.prod.yml up -d
```

**Wait for all services to start** (~90 seconds):
- Database initializes first
- Backend waits for database, then seeds demo data
- Frontend starts after backend is healthy

#### Step 4: View Startup Logs (Optional)

```bash
# Follow logs to see the startup process
docker compose -f docker-compose.prod.yml logs -f

# Press Ctrl+C to stop following logs (containers keep running)
```

Look for these success messages:
```
it-incidents-db      | database system is ready to accept connections
it-incidents-backend | Started ItIncidentsBackendApplication
it-incidents-backend | ✅ DATABASE PRÊTE AVEC DES DONNÉES RICHES !
it-incidents-frontend| start worker processes
```

#### Step 5: Verify Deployment

```bash
# Check if all containers are running
docker compose -f docker-compose.prod.yml ps

# Should show 3 containers: postgres, backend, frontend
```

Expected output:
```
NAME                    IMAGE                                                      STATUS
it-incidents-backend    ghcr.io/salaheddinbenhammich/it-incidents-backend:latest  Up (healthy)
it-incidents-db         postgres:16-alpine                                         Up (healthy)
it-incidents-frontend   ghcr.io/salaheddinbenhammich/it-incidents-frontend:latest Up
```

#### Step 6: Access the Application

🎉 **Open your browser and navigate to:**

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080
- **Swagger API Docs**: http://localhost:8080/swagger-ui.html

---

### Build Images Locally (Alternative)

If you want to build the Docker images yourself instead of using pre-built ones:

#### Step 1: Clone the Repository

```bash
# Clone the project
git clone https://github.com/salaheddinbenhammich/security_project.git

# Navigate to project directory
cd security_project
```

#### Step 2: Build and Start All Services

```bash
# Build images and start containers
docker compose up --build -d
```

This will:
1. Build the backend image from `it-incidents-backend/Dockerfile`
2. Build the frontend image from `frontend/Dockerfile`
3. Pull PostgreSQL image
4. Start all services

**First build takes 5-10 minutes** (downloads Maven/npm dependencies)

#### Step 3: View Build Logs (Optional)

```bash
# Follow logs during build and startup
docker compose logs -f

# Press Ctrl+C to stop following logs (containers keep running)
```

#### Step 4: Verify Deployment

```bash
# Check if all containers are running
docker compose ps
```

Expected output:
```
NAME                    IMAGE                           STATUS
it-incidents-backend    security_project-backend        Up (healthy)
it-incidents-db         postgres:16-alpine              Up (healthy)
it-incidents-frontend   security_project-frontend       Up
```

#### Step 5: Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080
- **Swagger API Docs**: http://localhost:8080/swagger-ui.html

---

### Choosing Between Pre-built vs Local Build

| Method | Pros | Cons | Use When |
|--------|------|------|----------|
| **Pre-built Images** | ✅ Fast (90 seconds)<br>✅ No build tools needed<br>✅ Consistent images | ❌ Requires internet<br>❌ Can't modify code | Quick deployment<br>Testing<br>Production |
| **Local Build** | ✅ Can modify code<br>✅ No external dependencies<br>✅ Full control | ❌ Slow first build (5-10 min)<br>❌ Requires Maven/Node | Development<br>Customization<br>Offline environments |

---

### Managing the Application

**For pre-built images (docker-compose.prod.yml):**

```bash
# Stop all services
docker compose -f docker-compose.prod.yml down

# Stop and remove all data (including database)
docker compose -f docker-compose.prod.yml down -v

# Restart services
docker compose -f docker-compose.prod.yml restart

# View logs
docker compose -f docker-compose.prod.yml logs -f

# View logs for specific service
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f postgres

# Update to latest images
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

**For locally built images (docker-compose.yml):**

```bash
# Stop all services
docker compose down

# Stop and remove all data (including database)
docker compose down -v

# Rebuild and restart (after code changes)
docker compose up --build -d

# Restart services
docker compose restart

# View logs
docker compose logs -f

# Rebuild only specific service
docker compose up --build -d backend  # or frontend
```

---

## 👥 Demo Users

The application comes pre-seeded with demo users for testing:

### Active Users

| Username | Password | Email | Role | Status |
|----------|----------|-------|------|--------|
| **admin** | `Admin@2024Secure!` | admin@incidents.com | ADMIN | ✅ Active |
| **jean** | `Jean@2024Pass!` | jean@univ.fr | USER | ✅ Active |
| **alice** | `Alice@2024Pass!` | alice@univ.fr | USER | ✅ Active |
| **bob** | `Bob@2024Pass!` | bob@univ.fr | USER | ✅ Active |
| **charlie** | `Charlie@2024Pass!` | charlie@univ.fr | USER | ✅ Active |

### Special Status Users (for testing edge cases)

| Username | Password | Email | Role | Status |
|----------|----------|-------|------|--------|
| **pending_user** | `Pending@2024Pass!` | pending@univ.fr | USER | ⏳ Pending Approval |
| **expired_pass** | `Expired@2024Pass!` | expired@univ.fr | USER | ⚠️ Password Expired |
| **deleted_user** | `Deleted@2024Pass!` | deleted@univ.fr | USER | 🗑️ Soft Deleted |

### Pre-seeded Data

- **25 tickets** across different statuses:
  - 4 PENDING
  - 5 IN_PROGRESS
  - 5 RESOLVED
  - 5 CLOSED
  - 4 CANCELLED
  - 2 CRITICAL priority

---

## 🔧 Manual Deployment (Optional)

<details>
<summary><b>Click to expand manual deployment instructions</b></summary>

If you prefer to run services manually without Docker:

### Prerequisites

- **Java 17+** (OpenJDK or Oracle JDK)
- **Maven 3.9+**
- **Node.js 20+** and **npm**
- **PostgreSQL 16** (running locally or in Docker)
- **Git**

---

### 1. Database Setup

#### Option A: PostgreSQL with Docker

```bash
docker run --name it-incidents-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=it_incidents \
  -p 5432:5432 \
  -d postgres:16-alpine
```

#### Option B: Local PostgreSQL Installation

```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres psql
CREATE DATABASE it_incidents;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE it_incidents TO postgres;
\q
```

---

### 2. Clone Repository

```bash
git clone https://github.com/salaheddinbenhammich/security_project.git
cd security_project
```

---

### 3. Backend Setup

#### Create .env file

Create `it-incidents-backend/.env`:

```bash
cd it-incidents-backend
nano .env
```

Paste:

```env
# Database Configuration
DATABASE_URL=jdbc:postgresql://localhost:5432/it_incidents
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# JWT Configuration
JWT_SECRET=C^aQoGhJwA!K&472W%$7HYu13ogl^ymv3#q2SmA7iJ961DdQ7s
JWT_EXPIRATION=3600000           # 1 hour in milliseconds
JWT_REFRESH_EXPIRATION=86400000  # 1 day in milliseconds
```

#### Build and Run

```bash
# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

**Backend will start on**: http://localhost:8080

---

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend will start on**: http://localhost:5173

---

### 5. Verify Setup

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **Swagger Docs**: http://localhost:8080/swagger-ui.html

Login with: `admin` / `Admin@2024Secure!`

</details>

---

## 📚 API Documentation

Once the backend is running, access interactive API documentation:

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/api-docs


---

## 🐛 Troubleshooting

> **Note**: Replace `docker compose -f docker-compose.prod.yml` with `docker compose` if you built images locally.

### Port Already in Use

```bash
# Check what's using port 80
sudo lsof -i :80

# Kill the process
sudo kill -9 <PID>

# Or change port in docker-compose.yml or docker-compose.prod.yml
# frontend:
#   ports:
#     - "3000:80"  # Use port 3000 instead
```

### Backend Won't Start

```bash
# View backend logs (pre-built images)
docker compose -f docker-compose.prod.yml logs backend

# Or for local build
docker compose logs backend

# Check database connection
docker compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres

# Restart backend
docker compose -f docker-compose.prod.yml restart backend
```

### Frontend Can't Connect to Backend

```bash
# Check if backend is healthy
docker compose -f docker-compose.prod.yml ps

# Should show "Up (healthy)" for backend

# Check backend logs
docker compose -f docker-compose.prod.yml logs backend | grep "Started ItIncidentsBackendApplication"
```

### Database Issues

```bash
# Connect to database
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d it_incidents

# List tables
\dt

# Exit
\q

# Reset database (WARNING: Deletes all data)
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d
```

### Build Failures (Local Build Only)

```bash
# Clear Docker cache and rebuild
docker compose down
docker compose build --no-cache
docker compose up -d

# View build logs
docker compose build
```

### Permission Denied (Docker)

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login again, or run:
newgrp docker
```

### View All Container Logs

```bash
# Pre-built images
docker compose -f docker-compose.prod.yml logs -f --tail=100

# Local build
docker compose logs -f --tail=100
```

---

## 🔒 Security Notes

⚠️ **For Production Deployment**:

1. Change `JWT_SECRET` to a strong random value:
   ```bash
   openssl rand -base64 64
   ```

2. Use strong database passwords

3. Enable HTTPS/SSL

4. Configure firewall rules

5. Use environment-specific configuration files

6. Enable rate limiting

7. Regular security audits

---

## 📝 License

This project is licensed under the MIT License.

---

**Happy Deploying! 🚀**
