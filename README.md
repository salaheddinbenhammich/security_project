# Incident Management Project

This project is a **full-stack web application** composed of:
- **Backend**: Spring Boot (Java)
- **Frontend**: React
- **Database**: Postgresql (running in Docker)

The backend and frontend run **locally**, while the database runs **inside Docker**.

---


## 🚀 How to Run the Project

1. Start the database  
2. Configure environment variables  
3. Run the backend  
4. Run the frontend  

---


## ⚙️ Prerequisites

Make sure you have the following installed:

- **Java 17+**
- **Maven**
- **Node.js 18+** (recommended for React)
- **npm / yarn / pnpm**
- **Docker & Docker Compose**
- **Git**

---

## 🐳 Database (PostgreSQL with Docker)

The MySQL database runs inside Docker.

### Start PostgreSQL container First (make ur user,  password, etc)

```bash
docker run --name it-incidents-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=it_incidents \
  -p 5432:5432 \
  -d postgres:latest

```

### Verify DB Container is running

```bash
docker ps
```
---
## 🔧 Environment Variables
Create a .env file in the root of the backend project with the following content:
```bash
# Database Configuration
DATABASE_URL=jdbc:postgresql://localhost:5432/it_incidents
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRATION=3600000         # 1 hour in milliseconds (you can change it)
JWT_REFRESH_EXPIRATION=86400000 # 1 day in milliseconds  (you can change it)

```
---

## 🔐 Demo Users & Credentials

> ⚠️ These credentials are **for development/demo only**.

| Role | Username | Email | Password |
|----|------|--------|----------|
| **Admin** | admin | admin@incidents.com | Admin123! |
| **User** | user | jean@univ.fr | User123! |

Passwords are stored securely using **BCrypt hashing** in the database and cannot be retrieved in plain text.

---

## 🚀 Backend (Spring Boot)

### 1. Navigate to backend

```bash
cd it-incidents-backend
```

### 2. Build the project

```bash
mvn clean install OR on Windows .\mvnw clean install
```
### 3. Run the backend
```bash
mvn spring-boot:run ``` OR on Windows ```bash.\mvnw spring-boot:run ```


Wait until you see:

```
Started ItIncidentsBackendApplication
```

Backend will run on:

```
http://localhost:8080
```

---


## 🌐 Frontend (React)

### 1. Navigate to frontend

```bash
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 4. Start frontend

```bash
npm run dev
```

Frontend will run on:

```
http://localhost:5173
```

---

## ⚡ Notes

Make sure the PostgreSQL container is running before starting the backend.

If ports 5432, 8080, or 3000 are already in use, adjust the docker run port mappings or frontend/backend configs.

.env should never be committed to a public repository since it contains secrets.

Demo users are created automatically by the DataSeeder on the first run.
---
