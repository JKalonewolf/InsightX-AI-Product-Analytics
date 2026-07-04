# Stage 1: Build Vite React SPA
FROM node:18-alpine AS builder

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Serve with Nginx Proxy
FROM nginx:1.25-alpine

# Copy built React assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy standalone SDK scripts to serve
COPY sdk /usr/share/nginx/html/sdk

# Copy raw PM documents to serve in portfolio center
COPY docs /usr/share/nginx/html/docs

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
