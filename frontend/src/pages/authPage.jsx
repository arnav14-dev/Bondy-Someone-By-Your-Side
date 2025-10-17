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
import '../styles/AuthPage.css';

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
    profilePicture: null,
    profilePictureFile: null,
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
    { id: 2, title: 'Profile Picture', description: 'Add your photo' },
    { id: 3, title: 'Complete', description: 'Review and finish' },
  ];

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (files && files[0]) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0],
        [`${name}File`]: files[0]
      }));
    } else {
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
      if (!formData.profilePictureFile) {
        toast.error('Please upload a profile picture');
        return;
      }
    }
    
    setIsLoading(true);
    
    // Test backend connection first
    try {
      setLoadingStep('Connecting to server...');
      const response = await axios.get('http://localhost:3001/', { timeout: 5000 });
    } catch (error) {
      console.error('Backend connection failed:', error);
      console.error('Error URL:', error.config?.url);
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

        console.log('Login data being sent:', loginData);
        console.log('Contact number length:', formData.contactNumber?.length);
        
        setLoadingStep('Signing you in...');
        const validatedData = loginSchema.parse(loginData);
        console.log('Validated login data:', validatedData);
        const response = await axios.post(getApiEndpoint('/auth/login'), validatedData);
        
        if (response.data.success) {
          localStorage.setItem('currentUser', JSON.stringify(response.data.data));
          toast.success('Login successful!');
          window.location.href = '/home';
        }
      } else {
        // Signup logic
        const validatedData = signupSchema.parse(formData);
        
        // Handle file uploads
      let profilePictureUrl = null;

        if (formData.profilePictureFile) {
          try {
            setLoadingStep('Uploading profile picture...');
            const uploadUrl = getApiEndpoint('/s3/get-pre-signed-url');
            const profileResponse = await axios.post(uploadUrl, {
              fileName: formData.profilePictureFile.name,
              fileType: formData.profilePictureFile.type,
              folder: 'profiles'
            }, {
              timeout: 10000, // 10 second timeout
              headers: {
                'Content-Type': 'application/json'
              }
            });
            
            // Upload the actual file to S3 using the pre-signed URL
            const uploadResponse = await axios.put(profileResponse.data.data.uploadUrl, formData.profilePictureFile, {
              headers: {
                'Content-Type': formData.profilePictureFile.type
              }
            });
            
            // Get the S3 file name for storage
            const s3FileName = profileResponse.data.data.s3FileName;
            profilePictureUrl = s3FileName;
          } catch (error) {
            console.error('Profile picture upload error:', error);
            console.error('Upload URL was:', error.config?.url);
            if (error.code === 'ERR_NETWORK') {
              throw new Error('Cannot connect to server. Please check if the backend is running.');
            }
            throw new Error('Failed to upload profile picture');
          }
        }


            const signupData = {
          ...validatedData,
          profilePicture: profilePictureUrl || null,
          profilePictureOriginalName: formData.profilePictureFile?.name || null,
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
          localStorage.setItem('currentUser', JSON.stringify(response.data.data));
          toast.success('Account created successfully!');
          window.location.href = '/home';
        }
      }
        } catch (error) {
      console.error('Auth error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
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
        toast.error(`Request failed: ${error.response?.status || 'Unknown error'}`);
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
      profilePicture: null,
      profilePictureFile: null,
    });
    setErrors({});
  };

  return (
    <div className="auth-page">
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
      <div className="auth-background">
        <div className="auth-background-gradient" />
        <div className="auth-background-pattern" />
      </div>

      {/* Main Content */}
    <div className="auth-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="auth-card"
        >
          {/* Header */}
        <div className="auth-header">
            <div className="auth-logo">
              <img src="/assets/logo.png" alt="Bondy Logo" className="logo-image" />
            </div>
            <h1 className="auth-title">
              {isLogin ? 'Welcome Back' : 'Join Our Community'}
            </h1>
            <p className="auth-subtitle">
              {isLogin 
                ? 'Sign in to continue your journey with us'
                : 'Create your account and start connecting with trusted companions'
              }
            </p>
              {/* Progress Steps (Signup only) */}
              {!isLogin && (
        <motion.div 
          className="auth-steps"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="step-counter">
            {currentStep}/{steps.length}
          </div>
        </motion.div>
              )}
          </div>


          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-content">
            {/* Step 1: Account Details */}
            {currentStep === 1 && (
              <div className="form-step">
          {isLogin ? (
            <div className="form-group">
              <div className="input-group">
                <Phone className="input-icon" />
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  className={`input ${errors.contactNumber ? 'input-error' : ''}`}
                  placeholder={placeholderErrors.contactNumber || "Enter your contact number"}
                />
              </div>
            </div>
          ) : (
            <div className="form-group">
              <div className="input-group">
                <User className="input-icon" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`input ${errors.username ? 'input-error' : ''}`}
                  placeholder={placeholderErrors.username || "Enter your username"}
                />
              </div>
            </div>
          )}

          <div className="form-group">
                    <div className="input-group">
                      <Lock className="input-icon" />
                            <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`input ${errors.password ? 'input-error' : ''}`}
                        placeholder={placeholderErrors.password || "Enter your password"}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    </div>

                  {!isLogin && (
          <div className="form-group">
                      <div className="input-group">
                        <Phone className="input-icon" />
                        <input
                          type="tel"
                          name="contactNumber"
                          value={formData.contactNumber}
                          onChange={handleInputChange}
                          className={`input ${errors.contactNumber ? 'input-error' : ''}`}
                          placeholder={placeholderErrors.contactNumber || "Enter your 10-digit phone number"}
                        />
                      </div>
                    </div>
                  )}
              </div>
            )}


            {/* Step 2: Profile Picture (Signup only) */}
            {!isLogin && currentStep === 2 && (
              <div className="form-step">
                  <div className="profile-picture-header">
                    <h3><Camera className="profile-icon" /> Add Your Photo (Optional)</h3>
                    <p>Help others recognize you by adding a clear profile picture</p>
                  </div>

                  <div className="profile-picture-upload">
              <input
                type="file"
                        name="profilePicture"
                      onChange={handleInputChange}
                      accept="image/*"
                      id="profile-upload"
                className="file-input"
                    />
                    <label htmlFor="profile-upload" className="upload-area">
                      {formData.profilePictureFile ? (
                        <div className="uploaded-image">
                          <img
                            src={URL.createObjectURL(formData.profilePictureFile)}
                            alt="Profile preview"
                            className="preview-image"
                          />
                          <div className="upload-overlay">
                            <Upload size={24} />
                            <span>Change Photo</span>
                          </div>
                        </div>
                      ) : (
                        <div className="upload-placeholder">
                          <Upload size={48} />
                          <span>Click to upload photo</span>
                          <p>JPG, PNG up to 5MB</p>
                        </div>
                      )}
              </label>
            </div>
              </div>
            )}

            {/* Step 3: Complete (Signup only) */}
            {!isLogin && currentStep === 3 && (
              <div className="form-step">
                  <div className="completion-header">
                    <h3><CheckCircle className="completion-icon" /> Review Your Information</h3>
                    <p>Please review your details before creating your account</p>
          </div>

                  <div className="review-section">
                    <div className="review-item">
                      <span className="review-label">Username:</span>
                      <span className="review-value">{formData.username}</span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">Contact:</span>
                      <span className="review-value">{formData.contactNumber}</span>
                    </div>
                    {formData.profilePictureFile && (
                      <div className="review-item">
                        <span className="review-label">Profile Picture:</span>
                        <span className="review-value">✓ Uploaded</span>
                      </div>
                    )}
                  </div>
              </div>
            )}
            </div>
            
            {/* Form Actions - Fixed at bottom */}
            <div className="form-actions">
              {!isLogin && currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={isLoading}
                  className="btn btn-outline"
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
                  className="btn btn-primary"
                >
                  Next
                  <ArrowRight size={20} />
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="btn btn-primary"
                >
                  {isLoading ? (
                    <div className="loading-container">
                      <div className="loading-spinner" />
                      <span className="loading-text">{loadingStep}</span>
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
          <div className="auth-toggle">
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              onClick={toggleAuthMode}
              className="toggle-link"
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