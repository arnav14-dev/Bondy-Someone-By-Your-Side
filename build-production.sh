#!/bin/bash

# Production Build Script for Gen-Link
# This script builds both frontend and backend for production deployment

set -e  # Exit on any error

echo "🚀 Starting production build process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    print_warning "Backend .env file not found. Creating from example..."
    if [ -f "backend/config.example.js" ]; then
        print_status "Please copy backend/config.example.js to backend/.env and update with your production values"
    else
        print_error "No environment configuration found. Please create backend/.env file"
        exit 1
    fi
fi

if [ ! -f "frontend/.env.local" ]; then
    print_warning "Frontend .env.local file not found. Creating from example..."
    if [ -f "frontend/src/config/env.example.js" ]; then
        print_status "Please copy frontend/src/config/env.example.js to frontend/.env.local and update with your production values"
    else
        print_error "No frontend environment configuration found. Please create frontend/.env.local file"
        exit 1
    fi
fi

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
npm install --production
cd ..

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Build frontend
print_status "Building frontend for production..."
cd frontend
npm run build:prod
cd ..

# Create production directory
print_status "Creating production directory..."
rm -rf production
mkdir -p production

# Copy backend files
print_status "Copying backend files..."
cp -r backend production/
rm -rf production/backend/node_modules
rm -rf production/backend/test-*.txt
rm -rf production/backend/test-*.svg

# Copy frontend build
print_status "Copying frontend build..."
cp -r frontend/dist production/frontend

# Create production package.json
print_status "Creating production package.json..."
cat > production/package.json << EOF
{
  "name": "gen-link-production",
  "version": "1.0.0",
  "description": "Gen-Link Production Build",
  "main": "backend/server.js",
  "scripts": {
    "start": "cd backend && npm start",
    "install-deps": "cd backend && npm install --production",
    "postinstall": "npm run install-deps"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
EOF

# Create production README
print_status "Creating production README..."
cat > production/README.md << EOF
# Gen-Link Production Build

## Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0
- MongoDB
- AWS S3 bucket (for file uploads)

## Environment Variables
Make sure to set the following environment variables in your production environment:

### Backend (.env)
- MONGODB_URI: MongoDB connection string
- AWS_ACCESS_KEY_ID: AWS access key for S3
- AWS_SECRET_ACCESS_KEY: AWS secret key for S3
- AWS_REGION: AWS region (e.g., us-east-1)
- S3_BUCKET_NAME: S3 bucket name
- JWT_SECRET: Secret key for JWT tokens
- CORS_ORIGIN: Allowed CORS origins (comma-separated)
- NODE_ENV: production

### Frontend (.env.local)
- VITE_API_HOST: Your API domain
- VITE_API_PORT: API port (if not 80/443)
- VITE_API_PROTOCOL: https or http
- VITE_OPENCAGE_API_KEY: OpenCage API key for geocoding

## Deployment
1. Upload the production folder to your server
2. Run: npm install
3. Set environment variables
4. Run: npm start

## File Structure
- backend/: Backend application
- frontend/: Frontend build files
- package.json: Production package configuration
EOF

# Create Docker files
print_status "Creating Docker configuration..."

# Backend Dockerfile
cat > production/backend/Dockerfile << EOF
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start application
CMD ["node", "server.js"]
EOF

# Docker Compose
cat > production/docker-compose.yml << EOF
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=\${MONGODB_URI}
      - AWS_ACCESS_KEY_ID=\${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=\${AWS_SECRET_ACCESS_KEY}
      - AWS_REGION=\${AWS_REGION}
      - S3_BUCKET_NAME=\${S3_BUCKET_NAME}
      - JWT_SECRET=\${JWT_SECRET}
      - CORS_ORIGIN=\${CORS_ORIGIN}
    depends_on:
      - mongodb
    restart: unless-stopped

  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./frontend:/usr/share/nginx/html
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  mongodb_data:
EOF

# Nginx configuration
cat > production/nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=login:10m rate=1r/s;

    upstream backend {
        server backend:3001;
    }

    server {
        listen 80;
        server_name your-domain.com;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # Frontend
        location / {
            root /usr/share/nginx/html;
            try_files \$uri \$uri/ /index.html;
        }

        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
        }

        # Login rate limiting
        location /api/auth/login {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
    }
}
EOF

print_status "✅ Production build completed successfully!"
print_status "📁 Production files are in the 'production' directory"
print_status "🐳 Docker configuration included"
print_status "🌐 Nginx configuration included"
print_status ""
print_status "Next steps:"
print_status "1. Update environment variables in production/backend/.env"
print_status "2. Update nginx.conf with your domain name"
print_status "3. Deploy to your server"
print_status "4. Run: docker-compose up -d"
print_status ""
print_status "For manual deployment:"
print_status "1. Upload production folder to server"
print_status "2. Run: npm install && npm start"