import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading, true = authenticated, false = not authenticated
  
  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const currentUser = localStorage.getItem('currentUser');
      const token = localStorage.getItem('token');
      
      console.log('ProtectedRoute check - currentUser:', !!currentUser, 'token:', !!token);
      console.log('ProtectedRoute - token preview:', token ? token.substring(0, 20) + '...' : 'null');
      
      // Check if token is a valid JWT format (starts with eyJ)
      const isValidToken = token && token.startsWith('eyJ');
      
      // Additional JWT validation
      if (token && !isValidToken) {
        console.log('ProtectedRoute - Invalid JWT format:', {
          tokenStart: token.substring(0, 10),
          expectedStart: 'eyJ',
          isValidFormat: token.startsWith('eyJ')
        });
      }
      
      if (!currentUser || !token || !isValidToken) {
        console.log('ProtectedRoute - not authenticated. Reason:', {
          noUser: !currentUser,
          noToken: !token,
          invalidToken: !isValidToken
        });
        
        // Clear any invalid data
        if (!currentUser || !token) {
          localStorage.removeItem('currentUser');
          localStorage.removeItem('token');
        }
        
        setIsAuthenticated(false);
      } else {
        console.log('ProtectedRoute - user authenticated');
        console.log('ProtectedRoute - user data:', JSON.parse(currentUser));
        setIsAuthenticated(true);
      }
    };
    
    checkAuth();
  }, []);
  
  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Checking authentication...
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // User is authenticated, render the protected component
  return children;
};

export default ProtectedRoute;
