// API Configuration
// Automatically detects if running on localhost or network and sets appropriate API URL

const getApiUrl = () => {
  // Check if we're running on localhost or network
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Running locally
    return 'http://localhost:3001/api';
  } else {
    // Running on network - use the same IP as the frontend but port 3001
    return `http://${hostname}:3001/api`;
  }
};

export const BASE_API_URL = getApiUrl();

// For direct API calls (like in authPage.jsx)
export const getApiEndpoint = (endpoint) => {
  const baseUrl = getApiUrl();
  return `${baseUrl}${endpoint}`;
};

export default BASE_API_URL;
