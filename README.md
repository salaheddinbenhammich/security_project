# Incident Management Project

This project is a **full-stack web application** composed of:
- **Backend**: Spring Boot (Java)
- **Frontend**: React
- **Database**: Postgresql (running in Docker)

The backend and frontend run **locally**, while the database runs **inside Docker**.

---

## 🚀 How to Run the Project


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

### 2. Configure database connection

Check `application.yml` or `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/incident_db
spring.datasource.username=root
spring.datasource.password=root
```

> ⚠️ `localhost` works because Docker exposes MySQL on port `3306`.

### 3. Start backend
```bash
mvn clean install OR .\mvnw clean install
```

```bash
mvn spring-boot:run OR .\mvnw spring-boot:run
```

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
http://localhost:3000
```

---
