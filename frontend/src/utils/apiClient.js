import axios from 'axios';
import { getApiEndpoint } from '../config/api.js';

// Create axios instance with default config
const apiClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add user ID to headers for protected routes
apiClient.interceptors.request.use(
  (config) => {
    // Get user ID from localStorage
    const currentUser = localStorage.getItem('currentUser');
    console.log('API Client - Current user from localStorage:', currentUser);
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        console.log('API Client - Parsed user:', user);
        if (user._id) {
          config.headers['user-id'] = user._id;
          console.log('API Client - Added user-id header:', user._id);
        } else {
          console.warn('API Client - User has no _id field');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    } else {
      console.warn('API Client - No user found in localStorage');
    }
    console.log('API Client - Request headers:', config.headers);
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
      // User is not authenticated, redirect to login
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
