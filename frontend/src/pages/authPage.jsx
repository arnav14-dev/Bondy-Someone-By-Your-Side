import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  Camera
} from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { z } from 'zod';
import { getApiEndpoint } from '../config/api.js';
import axios from 'axios';
import '../styles/authPageUnique.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    contactNumber: '',
  });
  const [errors, setErrors] = useState({});
  const [placeholderErrors, setPlaceholderErrors] = useState({});

  // Function to show error in placeholder for 2 seconds
  const showPlaceholderError = (fieldName, errorMessage) => {
    setPlaceholderErrors(prev => ({
      ...prev,
      [fieldName]: errorMessage
    }));

    setTimeout(() => {
      setPlaceholderErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }, 2000);
  };

  // Validation schemas
  const loginSchema = z.object({
    contactNumber: z.string().min(10, 'Please enter a valid 10-digit phone number').max(15, 'Phone number is too long'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  });

  const signupSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be less than 20 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    contactNumber: z.string().min(10, 'Please enter a valid 10-digit phone number').max(15, 'Phone number is too long'),
  });

  const steps = [
    { id: 1, title: isLogin ? 'Login' : 'Account Details', description: isLogin ? 'Enter your credentials' : 'Basic information' },
    { id: 2, title: 'Complete', description: 'Review and finish' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // For contact number, only allow digits
    if (name === 'contactNumber') {
      const digitsOnly = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: digitsOnly
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };


  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (isLogin) {
        if (!formData.contactNumber) {
          newErrors.contactNumber = 'Contact number is required';
          showPlaceholderError('contactNumber', 'Contact number is required');
        }
        if (!formData.password) {
          newErrors.password = 'Password is required';
          showPlaceholderError('password', 'Password is required');
        }
      } else {
        if (!formData.username) {
          newErrors.username = 'Username is required';
          showPlaceholderError('username', 'Username is required');
        }
        if (!formData.password) {
          newErrors.password = 'Password is required';
          showPlaceholderError('password', 'Password is required');
        }
        if (!formData.contactNumber) {
          newErrors.contactNumber = 'Contact number is required';
          showPlaceholderError('contactNumber', 'Contact number is required');
        }
      }
    }

    // Step 2 (Profile Picture) is optional - no validation needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = (e) => {
    if (e) {
      e.preventDefault();
    }
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Only submit if it's the final step or login
    if (!isLogin && currentStep < steps.length) {
      return;
    }

    // Additional validation before submission
    if (!isLogin) {
      // Profile picture validation removed
    }

    setIsLoading(true);

    // Test backend connection first
    try {
      setLoadingStep('Connecting to server...');
      const baseUrl = getApiEndpoint('/').replace('/api', '');
      const response = await axios.get(baseUrl, { timeout: 5000 });
    } catch (error) {
      toast.error('Cannot connect to server. Please ensure the backend is running.');
      setIsLoading(false);
      setLoadingStep('');
      return;
    }

    try {
      if (isLogin) {
        // Login logic
        const loginData = {
          contactNumber: formData.contactNumber,
          password: formData.password
        };


        setLoadingStep('Signing you in...');
        const validatedData = loginSchema.parse(loginData);
        const response = await axios.post(getApiEndpoint('/auth/login'), validatedData);

        if (response.data.success) {
          // Store user data and token separately
          localStorage.setItem('currentUser', JSON.stringify(response.data.data.user));
          localStorage.setItem('token', response.data.data.token);
          toast.success('Login successful!');
          window.location.href = '/home';
        }
      } else {
        // Signup logic
        const validatedData = signupSchema.parse(formData);

        const signupData = {
          ...validatedData,
        };

        // Clean up undefined values
        Object.keys(signupData).forEach(key => {
          if (signupData[key] === undefined) {
            delete signupData[key];
          }
        });

        setLoadingStep('Creating your account...');

        const response = await axios.post(getApiEndpoint('/auth/signup'), signupData);

        if (response.data.success) {
          // Store user data and token separately
          localStorage.setItem('currentUser', JSON.stringify(response.data.data.user));
          localStorage.setItem('token', response.data.data.token);
          toast.success('Account created successfully!');
          window.location.href = '/home';
        }
      }
    } catch (error) {
      // Clear any existing toasts first
      toast.dismiss();

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.errors) {
        const errorMessages = error.errors.map(err => err.message).join(', ');
        toast.error(errorMessages);
      } else {
        toast.error('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setCurrentStep(1);
    setFormData({
      username: '',
      password: '',
      contactNumber: '',
    });
    setErrors({});
  };

  return (
    <div className="auth-unique-page">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />

      {/* Background */}
      <div className="auth-unique-background">
        <div className="auth-unique-background-gradient" />
        <div className="auth-unique-background-pattern" />
      </div>

      {/* Main Content */}
      <div className="auth-unique-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="auth-unique-card"
        >
          {/* Header */}
          <div className="auth-unique-header">
            <div className="auth-unique-logo">
              <img src="/assets/logo.png" alt="Bondy Logo" className="auth-unique-logo-image" />
            </div>
            <h1 className="auth-unique-title">
              {isLogin ? 'Welcome Back' : 'Join Our Community'}
            </h1>
            <p className="auth-unique-subtitle">
              {isLogin
                ? 'Sign in to continue your journey with us'
                : 'Create your account and start connecting with trusted companions'
              }
            </p>
            {/* Progress Steps (Signup only) */}
            {!isLogin && (
              <motion.div
                className="auth-unique-steps"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="auth-unique-step-counter">
                  {currentStep}/{steps.length}
                </div>
              </motion.div>
            )}
          </div>


          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-unique-form">
            <div className="auth-unique-form-content">
              {/* Step 1: Account Details */}
              {currentStep === 1 && (
                <div className="auth-unique-form-step">
                  {isLogin ? (
                    <div className="auth-unique-form-group">
                      <div className="auth-unique-input-group">
                        <Phone className="auth-unique-input-icon" />
                        <input
                          type="tel"
                          name="contactNumber"
                          value={formData.contactNumber}
                          onChange={handleInputChange}
                          className={`auth-unique-input ${errors.contactNumber ? 'auth-unique-input-error' : ''}`}
                          placeholder={placeholderErrors.contactNumber || "Enter your contact number"}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="auth-unique-form-group">
                      <div className="auth-unique-input-group">
                        <User className="auth-unique-input-icon" />
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className={`auth-unique-input ${errors.username ? 'auth-unique-input-error' : ''}`}
                          placeholder={placeholderErrors.username || "Enter your username"}
                        />
                      </div>
                    </div>
                  )}

                  <div className="auth-unique-form-group">
                    <div className="auth-unique-input-group">
                      <Lock className="auth-unique-input-icon" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`auth-unique-input ${errors.password ? 'auth-unique-input-error' : ''}`}
                        placeholder={placeholderErrors.password || "Enter your password"}
                      />
                      <button
                        type="button"
                        className="auth-unique-password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {!isLogin && (
                    <div className="auth-unique-form-group">
                      <div className="auth-unique-input-group">
                        <Phone className="auth-unique-input-icon" />
                        <input
                          type="tel"
                          name="contactNumber"
                          value={formData.contactNumber}
                          onChange={handleInputChange}
                          className={`auth-unique-input ${errors.contactNumber ? 'auth-unique-input-error' : ''}`}
                          placeholder={placeholderErrors.contactNumber || "Enter your 10-digit phone number"}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}



              {/* Step 2: Complete (Signup only) */}
              {!isLogin && currentStep === 2 && (
                <div className="auth-unique-form-step">
                  <div className="auth-unique-completion-header">
                    <h3><CheckCircle className="auth-unique-completion-icon" /> Review Your Information</h3>
                    <p>Please review your details before creating your account</p>
                  </div>

                  <div className="auth-unique-review-section">
                    <div className="auth-unique-review-item">
                      <span className="auth-unique-review-label">Username:</span>
                      <span className="auth-unique-review-value">{formData.username}</span>
                    </div>
                    <div className="auth-unique-review-item">
                      <span className="auth-unique-review-label">Contact:</span>
                      <span className="auth-unique-review-value">{formData.contactNumber}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions - Fixed at bottom */}
            <div className="auth-unique-form-actions">
              {!isLogin && currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={isLoading}
                  className="auth-unique-btn auth-unique-btn-outline"
                >
                  <ArrowLeft size={20} />
                  Previous
                </button>
              )}

              {!isLogin && currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={isLoading}
                  className="auth-unique-btn auth-unique-btn-primary"
                >
                  Next
                  <ArrowRight size={20} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="auth-unique-btn auth-unique-btn-primary"
                >
                  {isLoading ? (
                    <div className="auth-unique-loading-container">
                      <div className="auth-unique-loading-spinner" />
                      <span className="auth-unique-loading-text">{loadingStep}</span>
                    </div>
                  ) : (
                    <>
                      {isLogin ? 'Sign In' : 'Create Account'}
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Auth Toggle */}
          <div className="auth-unique-auth-toggle">
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={toggleAuthMode}
                className="auth-unique-toggle-link"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;