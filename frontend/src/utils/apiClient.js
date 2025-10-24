import axios from 'axios';
import { BASE_API_URL } from '../config/api.js';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: `${BASE_API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add user ID and JWT token to headers for protected routes
apiClient.interceptors.request.use(
  (config) => {
    // Get user ID from localStorage
    const currentUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem('token');
    
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        if (user._id) {
          config.headers['user-id'] = user._id;
        } else {
          console.warn('API Client - User has no _id field');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    } else {
      console.warn('API Client - No user found in localStorage');
    }
    
    // Add JWT token to Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('API Client - No token found in localStorage');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('API Client - 401 error received:', error.response?.data);
      console.log('API Client - NOT redirecting automatically, letting component handle it');
      // Don't automatically redirect - let the component handle 401 errors
      // The ProtectedRoute should handle authentication, not the API client
    }
    return Promise.reject(error);
  }
);

export default apiClient;
