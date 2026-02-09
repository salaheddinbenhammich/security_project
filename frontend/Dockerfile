# Multi-stage build for React frontend
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built files to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create env config script that will run at container startup
RUN echo '#!/bin/sh' > /docker-entrypoint.d/40-generate-config.sh && \
    echo 'echo "window.ENV = { API_URL: \"${API_URL:-http://localhost:8080}\" };" > /usr/share/nginx/html/env-config.js' >> /docker-entrypoint.d/40-generate-config.sh && \
    chmod +x /docker-entrypoint.d/40-generate-config.sh

EXPOSE 80

# nginx starts automatically via base image entrypoint
