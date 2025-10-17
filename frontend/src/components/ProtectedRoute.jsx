import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check if user is logged in
  const currentUser = localStorage.getItem('currentUser');
  
  if (!currentUser) {
    // User is not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }
  
  // User is logged in, render the protected component
  return children;
};

export default ProtectedRoute;
