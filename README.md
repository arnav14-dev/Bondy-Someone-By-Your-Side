# Bondy-Someone-By-Your-Side

A comprehensive companion booking platform that connects users with trusted companions for various services and support needs.

## Overview

Bondy-Someone-By-Your-Side is a full-stack web application designed to facilitate secure and reliable companion bookings. The platform provides an intuitive interface for users to book companions for various services, manage their bookings, and maintain their profiles with advanced security features.

## Key Features

### User Management
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **Profile Management**: Complete user profiles with image upload capabilities
- **Location Services**: Integrated location management and selection
- **User Dashboard**: Comprehensive user management interface

### Booking System
- **Service Booking**: Multi-step booking process with real-time validation
- **Time Validation**: Advanced booking time validation (minimum 10 minutes ahead)
- **Booking Management**: Complete booking lifecycle management
- **Real-time Updates**: Live booking status updates

### Security & Performance
- **Rate Limiting**: Intelligent rate limiting with different limits for different endpoints
- **Image Optimization**: Advanced image caching and retry mechanisms
- **Input Validation**: Comprehensive input validation using Zod schemas
- **Security Headers**: Helmet.js integration for enhanced security

### Technical Features
- **Real-time Communication**: Socket.IO integration for live updates
- **File Management**: AWS S3 integration for secure file storage
- **Responsive Design**: Mobile-first responsive design
- **Error Handling**: Comprehensive error handling and user feedback

## Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **AWS S3** for file storage
- **Socket.IO** for real-time communication
- **JWT** for authentication
- **Zod** for schema validation
- **Helmet.js** for security headers
- **Express Rate Limit** for API protection

### Frontend
- **React 19** with modern hooks
- **Vite** for build tooling
- **React Router** for navigation
- **Framer Motion** for animations
- **Axios** for API communication
- **Tailwind CSS** for styling
- **Lucide React** for icons

## Project Structure

```
bondy-someone-by-your-side/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Utility functions
│   │   └── zod/             # Validation schemas
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── styles/         # CSS stylesheets
│   │   ├── utils/          # Utility functions
│   │   └── config/         # Configuration files
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── build-production.sh     # Production build script
├── start-dev.sh           # Development startup script
└── PRODUCTION_SETUP.md    # Production deployment guide
```

## Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0
- MongoDB (local or cloud)
- AWS S3 bucket (for file storage)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gen-link
   ```

2. **Install dependencies**
   ```bash
   # Backend dependencies
   cd backend
   npm install
   
   # Frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Backend configuration
   cp backend/config.example.js backend/.env
   # Edit backend/.env with your configuration
   
   # Frontend configuration
   cp frontend/src/config/env.example.js frontend/.env.local
   # Edit frontend/.env.local with your configuration
   ```

4. **Start development servers**
   ```bash
   # From project root
   ./start-dev.sh
   ```
   
   Or start manually:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - Get user bookings
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### User Management
- `GET /api/users` - Get all users (admin)
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user (admin)

### File Management
- `POST /api/s3/upload` - Upload file to S3
- `POST /api/s3/get-image-from-s3` - Get image from S3

## Environment Variables

### Backend (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/bondy-someone-by-your-side
DB_NAME=bondy-someone-by-your-side

# Server
PORT=3001
NODE_ENV=development

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-s3-bucket

# Security
JWT_SECRET=your_jwt_secret
BCRYPT_ROUNDS=12

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env.local)
```env
# API Configuration
VITE_API_HOST=localhost
VITE_API_PORT=3001
VITE_API_PROTOCOL=http

# App Configuration
VITE_APP_NAME=Bondy-Someone-By-Your-Side
VITE_APP_VERSION=1.0.0

# External Services
VITE_OPENCAGE_API_KEY=your_opencage_api_key
```

## Production Deployment

For production deployment, refer to the comprehensive [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md) guide which includes:

- Docker containerization
- Nginx configuration
- SSL setup
- Security hardening
- Performance optimizations
- Monitoring and logging

## Development Scripts

### Backend
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run prod       # Start production server with NODE_ENV=production
```

### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run build:prod # Build for production with production mode
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint issues
```

## Security Features

- **Authentication**: JWT-based authentication with secure token handling
- **Password Security**: bcrypt hashing with configurable rounds
- **Rate Limiting**: Intelligent rate limiting to prevent abuse
- **Input Validation**: Comprehensive input validation using Zod schemas
- **Security Headers**: Helmet.js integration for security headers
- **CORS Protection**: Configurable CORS policies
- **File Upload Security**: Secure file upload with AWS S3 integration

## Performance Optimizations

- **Image Caching**: Advanced image caching and retry mechanisms
- **Request Deduplication**: Prevents duplicate API requests
- **Compression**: Gzip compression for API responses
- **Connection Pooling**: Optimized database connections
- **Code Splitting**: Frontend code splitting for better performance

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Check the [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md) for deployment issues
- Review the API documentation in the code
- Check the console logs for debugging information

## Changelog

### Version 1.0.0
- Initial release with core booking functionality
- User authentication and profile management
- AWS S3 integration for file storage
- Real-time communication with Socket.IO
- Advanced security features and rate limiting
- Mobile-responsive design
- Comprehensive error handling and validation
