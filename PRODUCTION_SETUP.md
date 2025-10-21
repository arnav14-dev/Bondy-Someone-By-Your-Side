# Gen-Link Production Setup Guide

This guide will help you deploy Gen-Link to production with all necessary security and performance optimizations.

## 🚀 Quick Start

1. **Run the production build script:**
   ```bash
   ./build-production.sh
   ```

2. **Configure environment variables:**
   - Copy `backend/config.example.js` to `backend/.env`
   - Copy `frontend/src/config/env.example.js` to `frontend/.env.local`
   - Update with your production values

3. **Deploy:**
   - Upload the `production` folder to your server
   - Run `docker-compose up -d` for containerized deployment
   - Or run `npm install && npm start` for manual deployment

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- MongoDB (local or cloud)
- AWS S3 bucket
- Domain name (for production)
- SSL certificate (for HTTPS)

## 🔧 Environment Configuration

### Backend Environment Variables (.env)

```env
# Database
MONGODB_URI=mongodb://localhost:27017/gen-link-prod
DB_NAME=gen-link-prod

# Server
PORT=3001
NODE_ENV=production

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-s3-bucket

# Security
JWT_SECRET=your_super_secure_jwt_secret_here
BCRYPT_ROUNDS=12

# CORS (comma-separated domains)
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### Frontend Environment Variables (.env.local)

```env
# API Configuration
VITE_API_HOST=api.yourdomain.com
VITE_API_PORT=443
VITE_API_PROTOCOL=https

# App Configuration
VITE_APP_NAME=Gen-Link
VITE_APP_VERSION=1.0.0

# External Services
VITE_OPENCAGE_API_KEY=your_opencage_api_key

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

1. **Update docker-compose.yml:**
   - Set your domain name in nginx.conf
   - Update environment variables
   - Configure SSL certificates

2. **Deploy:**
   ```bash
   docker-compose up -d
   ```

3. **Check status:**
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

### Manual Docker Deployment

1. **Build backend:**
   ```bash
   cd production/backend
   docker build -t gen-link-backend .
   ```

2. **Run containers:**
   ```bash
   docker run -d --name gen-link-backend -p 3001:3001 gen-link-backend
   ```

## 🌐 Nginx Configuration

The production build includes a complete Nginx configuration with:

- **Security headers** (X-Frame-Options, X-XSS-Protection, etc.)
- **Gzip compression** for better performance
- **Rate limiting** to prevent abuse
- **SSL termination** (configure your certificates)
- **Static file serving** for frontend
- **API proxying** to backend

### SSL Setup

1. **Obtain SSL certificates** (Let's Encrypt recommended)
2. **Update nginx.conf** with your domain
3. **Place certificates** in `production/ssl/` directory
4. **Add SSL configuration** to nginx.conf

## 🔒 Security Features

### Backend Security
- **Helmet.js** for security headers
- **Rate limiting** to prevent abuse
- **CORS** configuration for production
- **Input validation** with Zod
- **Password hashing** with bcrypt
- **Environment variable** protection

### Frontend Security
- **Content Security Policy** headers
- **XSS protection** headers
- **Environment variable** protection
- **API key** externalization

## 📊 Monitoring & Logging

### Logging
- **Request logging** with timestamps
- **Error logging** with stack traces
- **Environment-specific** log levels

### Health Checks
- **Docker health checks** included
- **API endpoint** monitoring
- **Database connection** monitoring

## 🚀 Performance Optimizations

### Backend
- **Compression** middleware
- **Rate limiting** to prevent abuse
- **Connection pooling** for MongoDB
- **Error handling** optimization

### Frontend
- **Code splitting** with Vite
- **Asset optimization** and minification
- **Gzip compression** via Nginx
- **Caching headers** for static assets

## 🔄 Deployment Process

### Automated Deployment
1. **Run build script:** `./build-production.sh`
2. **Upload to server:** `scp -r production/ user@server:/path/`
3. **Deploy:** `docker-compose up -d`

### Manual Deployment
1. **Build frontend:** `npm run build:prod`
2. **Install backend deps:** `cd backend && npm install --production`
3. **Set environment variables**
4. **Start services:** `npm start`

## 🛠️ Maintenance

### Updates
1. **Pull latest changes**
2. **Run build script**
3. **Deploy new version**
4. **Restart services**

### Monitoring
- **Check logs:** `docker-compose logs -f`
- **Monitor resources:** `docker stats`
- **Health checks:** `curl http://yourdomain.com/api/health`

### Backup
- **Database backup:** `mongodump --uri="your_mongodb_uri"`
- **File backup:** Backup S3 bucket
- **Configuration backup:** Save .env files securely

## 🆘 Troubleshooting

### Common Issues

1. **CORS errors:**
   - Check CORS_ORIGIN in backend .env
   - Verify frontend API configuration

2. **Database connection:**
   - Check MONGODB_URI
   - Verify MongoDB is running

3. **S3 uploads failing:**
   - Check AWS credentials
   - Verify S3 bucket permissions

4. **Rate limiting:**
   - Adjust RATE_LIMIT_MAX_REQUESTS
   - Check nginx rate limiting

### Debug Mode
Set `NODE_ENV=development` and `VITE_ENABLE_DEBUG=true` for detailed error messages.

## 📞 Support

For issues or questions:
1. Check the logs first
2. Verify environment variables
3. Test API endpoints individually
4. Check network connectivity

## 🔐 Security Checklist

- [ ] All API keys moved to environment variables
- [ ] CORS properly configured for production domains
- [ ] SSL certificates installed and configured
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Database credentials secured
- [ ] AWS credentials with minimal permissions
- [ ] Regular security updates scheduled
- [ ] Monitoring and alerting set up
- [ ] Backup strategy implemented