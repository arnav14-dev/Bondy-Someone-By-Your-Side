// API Configuration
// Automatically detects environment and sets appropriate API URL

const getApiUrl = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // Check if we're in production
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    // Production environment - use environment variable or construct from current domain
    const apiHost = import.meta.env.VITE_API_HOST || hostname;
    const apiPort = import.meta.env.VITE_API_PORT || (protocol === 'https:' ? '443' : '3001');
    const apiProtocol = import.meta.env.VITE_API_PROTOCOL || protocol;
    
    // If port is 443 for HTTPS or 80 for HTTP, don't include it in URL
    if ((apiProtocol === 'https:' && apiPort === '443') || 
        (apiProtocol === 'http:' && apiPort === '80')) {
      return `${apiProtocol}//${apiHost}`;
    }
    
    return `${apiProtocol}//${apiHost}:${apiPort}`;
  } else {
    // Development environment
    const devPort = import.meta.env.VITE_DEV_API_PORT || '3001';
    return `http://localhost:${devPort}`;
  }
};

export const BASE_API_URL = getApiUrl();

// For direct API calls (like in authPage.jsx)
export const getApiEndpoint = (endpoint) => {
  const baseUrl = getApiUrl();
  return `${baseUrl}/api${endpoint}`;
};

// Environment configuration
export const ENV_CONFIG = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  apiUrl: BASE_API_URL,
  appName: import.meta.env.VITE_APP_NAME || 'Gen-Link',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0'
};

export default BASE_API_URL;