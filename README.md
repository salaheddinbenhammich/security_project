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
  - Session timeout (30 minutes inactivity)
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

#### Step 1: Create Deployment Directory

```bash
# Create project directory
mkdir it-incidents-app
cd it-incidents-app
```

#### Step 2: Download docker-compose.yml

Create a file named `docker-compose.yml`:

```bash
nano docker-compose.yml
```

Paste this content:

```yaml
services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: it-incidents-db
    environment:
      POSTGRES_DB: it_incidents
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - it-incidents-network
    restart: unless-stopped

  # Spring Boot Backend (from GitHub Container Registry)
  backend:
    image: ghcr.io/salaheddinbenhammich/it-incidents-backend:latest
    container_name: it-incidents-backend
    environment:
      DATABASE_URL: jdbc:postgresql://postgres:5432/it_incidents
      DATABASE_USER: postgres
      DATABASE_PASSWORD: postgres
      JWT_SECRET: C^aQoGhJwA!K&472W%$$7HYu13ogl^ymv3#q2SmA7iJ961DdQ7s
      JWT_EXPIRATION: 3600000
      JWT_REFRESH_EXPIRATION: 86400000
      CORS_ALLOWED_ORIGINS: http://localhost:3000,http://localhost:5173,http://frontend:80,http://localhost:80
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s
    networks:
      - it-incidents-network
    restart: unless-stopped

  # React Frontend (from GitHub Container Registry)
  frontend:
    image: ghcr.io/salaheddinbenhammich/it-incidents-frontend:latest
    container_name: it-incidents-frontend
    environment:
      API_URL: /api
    ports:
      - "80:80"
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - it-incidents-network
    restart: unless-stopped

volumes:
  postgres_data:
    driver: local

networks:
  it-incidents-network:
    driver: bridge
```

Save and exit (Ctrl+X, then Y, then Enter).

#### Step 3: Pull and Start Containers

```bash
# Pull the latest images
docker compose pull

# Start all services
docker compose up -d

# View logs (optional)
docker compose logs -f
```

#### Step 4: Verify Deployment

```bash
# Check if all containers are running
docker compose ps

# Should show 3 containers: postgres, backend, frontend
```

Expected output:
```
NAME                    IMAGE                                                      STATUS
it-incidents-backend    ghcr.io/salaheddinbenhammich/it-incidents-backend:latest  Up (healthy)
it-incidents-db         postgres:16-alpine                                         Up (healthy)
it-incidents-frontend   ghcr.io/salaheddinbenhammich/it-incidents-frontend:latest Up
```

#### Step 5: Access the Application

🎉 **Open your browser and navigate to:**

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080
- **Swagger API Docs**: http://localhost:8080/swagger-ui.html

---

### Managing the Application

```bash
# Stop all services
docker compose down

# Stop and remove all data (including database)
docker compose down -v

# Restart services
docker compose restart

# View logs
docker compose logs -f

# View logs for specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres

# Update to latest images
docker compose pull
docker compose up -d
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

### Key Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | ❌ No |
| POST | `/api/auth/login` | Login user | ❌ No |
| POST | `/api/auth/refresh` | Refresh JWT token | ❌ No |
| POST | `/api/auth/change-expired-password` | Change expired password | ❌ No |
| GET | `/api/tickets` | Get all tickets | ✅ Yes |
| POST | `/api/tickets` | Create ticket | ✅ Yes (USER/ADMIN) |
| GET | `/api/tickets/{id}` | Get ticket details | ✅ Yes |
| PUT | `/api/tickets/{id}` | Update ticket | ✅ Yes |
| GET | `/api/users` | Get all users | ✅ Yes (ADMIN) |
| PUT | `/api/users/{id}/approve` | Approve user | ✅ Yes (ADMIN) |

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Check what's using port 80
sudo lsof -i :80

# Kill the process
sudo kill -9 <PID>

# Or change port in docker-compose.yml
# frontend:
#   ports:
#     - "3000:80"  # Use port 3000 instead
```

### Backend Won't Start

```bash
# View backend logs
docker compose logs backend

# Check database connection
docker compose exec postgres pg_isready -U postgres

# Restart backend
docker compose restart backend
```

### Frontend Can't Connect to Backend

```bash
# Check if backend is healthy
docker compose ps

# Should show "Up (healthy)" for backend

# Check backend logs
docker compose logs backend | grep "Started ItIncidentsBackendApplication"
```

### Database Issues

```bash
# Connect to database
docker compose exec postgres psql -U postgres -d it_incidents

# List tables
\dt

# Exit
\q

# Reset database (WARNING: Deletes all data)
docker compose down -v
docker compose up -d
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
docker compose logs -f --tail=100
```


---

## 📝 License

This project is licensed under the University of Lorraine License.

---

**Happy Deploying! 🚀**
