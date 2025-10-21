import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { getApiEndpoint } from '../config/api.js';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Check if user is already logged in
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      // User is already logged in, redirect to homepage
      window.location.href = '/home';
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Validation function
  const validateFormData = () => {
    setValidationError(''); // Clear any previous errors
    
    // Username validation
    if (!formData.username || formData.username.length < 3) {
      const errorMsg = 'Username must be at least 3 characters';
      setValidationError(errorMsg);
      alert(errorMsg);
      return false;
    }
    
    // Password validation
    if (!formData.password || formData.password.length < 8) {
      const errorMsg = 'Password must be at least 8 characters';
      setValidationError(errorMsg);
      alert(errorMsg);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Run validation
      if (!validateFormData()) {
        setIsLoading(false);
        return;
      }
      

      // Call login API
      const loginResponse = await axios.post(getApiEndpoint('/auth/login'), {
        username: formData.username,
        password: formData.password,
      });
      
      // Store user data in localStorage for homepage
      if (loginResponse.data.success) {
        const userData = loginResponse.data.data;
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Reset form after successful login
        setFormData({
          username: '',
          password: '',
        });

        // Redirect to homepage
        window.location.href = '/home';
        return;
      }
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response?.data?.message) {
        if (error.response.data.message.includes('Invalid credentials')) {
          errorMessage = 'Invalid username or password. Please check your credentials.';
        } else if (error.response.data.message.includes('User not found')) {
          errorMessage = 'No account found with this username. Please sign up first.';
        } else {
          errorMessage = error.response.data.message;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Welcome Back!</h1>
          <p className="auth-subtitle">Sign in to your Bondy account</p>
          {validationError && (
            <div style={{ 
              backgroundColor: '#fee', 
              color: '#c33', 
              padding: '10px', 
              borderRadius: '5px', 
              marginTop: '10px',
              border: '1px solid #fcc'
            }}>
              ⚠️ {validationError}
            </div>
          )}
          <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
            <div style={{ fontSize: '0.9em', color: '#666' }}>
              Don't have an account? 
              <a 
                href="/" 
                style={{ 
                  color: '#667eea', 
                  textDecoration: 'none',
                  fontWeight: '600',
                  marginLeft: '5px'
                }}
              >
                Sign Up
              </a>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className={`auth-form ${isLoading ? 'loading' : ''}`}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your username"
              minLength="3"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your password"
              minLength="8"
              required
            />
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
