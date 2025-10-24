import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading, true = authenticated, false = not authenticated
  
  useEffect(() => {
    // Check admin authentication status
    const checkAdminAuth = () => {
      const adminToken = localStorage.getItem('adminToken');
      
      console.log('AdminProtectedRoute check - adminToken:', !!adminToken);
      console.log('AdminProtectedRoute - token preview:', adminToken ? adminToken.substring(0, 20) + '...' : 'null');
      
      // Check if token is a valid JWT format (starts with eyJ)
      const isValidToken = adminToken && adminToken.startsWith('eyJ');
      
      // Additional JWT validation
      if (adminToken && !isValidToken) {
        console.log('AdminProtectedRoute - Invalid JWT format:', {
          tokenStart: adminToken.substring(0, 10),
          expectedStart: 'eyJ',
          isValidFormat: adminToken.startsWith('eyJ')
        });
      }
      
      if (!adminToken || !isValidToken) {
        console.log('AdminProtectedRoute - not authenticated. Reason:', {
          noToken: !adminToken,
          invalidToken: !isValidToken
        });
        
        // Clear any invalid data
        if (!adminToken) {
          localStorage.removeItem('adminToken');
        }
        
        setIsAuthenticated(false);
      } else {
        console.log('AdminProtectedRoute - admin authenticated');
        setIsAuthenticated(true);
      }
    };
    
    checkAdminAuth();
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
        Checking admin authentication...
      </div>
    );
  }
  
  // Redirect to admin login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  // Admin is authenticated, render the protected component
  return children;
};

export default AdminProtectedRoute;
