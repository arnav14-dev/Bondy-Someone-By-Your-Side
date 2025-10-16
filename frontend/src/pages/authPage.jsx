import React, { useState, useEffect } from 'react'
import '../styles/authPage.css'
import axios from 'axios';

const AuthPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    contactNumber: '',
    password: '',
    governmentId: '',
    governmentIdType: 'Aadhaar',
    profilePicture: null,
    idVerificationMethod: 'number', // 'number' or 'image'
    idImage: null,
  });

  const [profilePictureName, setProfilePictureName] = useState(null);
  const [idImageName, setIdImageName] = useState(null);

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
        const { name, value, files } = e.target;
        if (name === 'profilePicture' || name === 'idImage') {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleVerificationMethodChange = (method) => {
        setFormData({
            ...formData,
            idVerificationMethod: method,
            governmentId: method === 'image' ? '' : formData.governmentId,
            idImage: method === 'number' ? null : formData.idImage
        });
    };

  // Validation function that runs before any file uploads
  const validateFormData = () => {
    console.log('Starting form validation...', formData);
    setValidationError(''); // Clear any previous errors
    
    // Username validation
    if (!formData.username || formData.username.length < 3 || formData.username.length > 20) {
      const errorMsg = 'Username must be between 3 and 20 characters';
      setValidationError(errorMsg);
      alert(errorMsg);
      return false;
    }
    
    // Contact number validation
    if (!formData.contactNumber || formData.contactNumber.length !== 10 || !/^\d{10}$/.test(formData.contactNumber)) {
      const errorMsg = 'Contact number must be exactly 10 digits';
      setValidationError(errorMsg);
      alert(errorMsg);
      return false;
    }
    
    // Password validation
    if (!formData.password || formData.password.length < 8 || formData.password.length > 50) {
      const errorMsg = 'Password must be between 8 and 50 characters';
      setValidationError(errorMsg);
      alert(errorMsg);
      return false;
    }
    
    // Government ID validation based on verification method
    if (formData.idVerificationMethod === 'number') {
      if (!formData.governmentId || formData.governmentId.length < 10 || formData.governmentId.length > 20) {
        const errorMsg = 'Please enter a valid government ID number (10-20 characters)';
        setValidationError(errorMsg);
        alert(errorMsg);
        return false;
      }
      
      if (!/^[A-Za-z0-9]+$/.test(formData.governmentId)) {
        const errorMsg = 'Government ID number can only contain letters and numbers';
        setValidationError(errorMsg);
        alert(errorMsg);
        return false;
      }
    } else if (formData.idVerificationMethod === 'image') {
      if (!formData.idImage) {
        const errorMsg = 'Please upload your ID image';
        setValidationError(errorMsg);
        alert(errorMsg);
        return false;
      }
    }
    
    console.log('Form validation passed!');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Run all validation BEFORE any file uploads
      if (!validateFormData()) {
        console.log('Form validation failed, stopping process');
        setIsLoading(false);
        return;
      }
      
      console.log('All validations passed, proceeding with file uploads...');

      let profilePictureUrl = null;
      let idImageUrl = null;

      if(formData.profilePicture) {
        console.log('✅ VALIDATION PASSED - Getting pre-signed URL for profile picture...');
        try {
          profilePictureUrl = await axios.post('http://localhost:3001/api/s3/get-pre-signed-url', {
            key: formData.profilePicture.name,
            contentType: formData.profilePicture.type,
          });
          console.log('Profile picture pre-signed URL received:', profilePictureUrl.data);
        } catch (error) {
          console.error('Failed to get profile picture pre-signed URL:', error);
          throw error;
        }
      }

      if(formData.idVerificationMethod === 'image' && formData.idImage) {
        console.log('✅ VALIDATION PASSED - Getting pre-signed URL for ID image...');
        try {
          idImageUrl = await axios.post('http://localhost:3001/api/s3/get-pre-signed-url', {
            key: formData.idImage.name,
            contentType: formData.idImage.type,
          });
          console.log('ID image pre-signed URL received:', idImageUrl.data);
        } catch (error) {
          console.error('Failed to get ID image pre-signed URL:', error);
          throw error;
        }
      }

      // Upload profile picture to S3
      if (profilePictureUrl) {
        console.log('Uploading profile picture to S3...');
        console.log('Pre-signed URL:', profilePictureUrl.data);
        console.log('File to upload:', formData.profilePicture);
        try {
          const response = await axios.put(profilePictureUrl.data.data.uploadUrl, formData.profilePicture, {
            headers: {
              'Content-Type': formData.profilePicture.type,
            },
            maxRedirects: 0,
            validateStatus: function (status) {
              return status >= 200 && status < 300; // Accept only 2xx status codes
            }
          });
          
          console.log('S3 upload response status:', response.status);
          console.log('S3 upload response headers:', response.headers);
          console.log('Profile picture uploaded successfully to S3!');
        } catch (error) {
          console.error('Profile picture upload failed:', error);
          if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
            console.error('Response headers:', error.response.headers);
          }
          throw error;
        }
      }

      // Upload ID image to S3
      if (idImageUrl) {
        console.log('Uploading ID image to S3...');
        try {
          const response = await axios.put(idImageUrl.data.data.uploadUrl, formData.idImage, {
            headers: {
              'Content-Type': formData.idImage.type,
            },
            maxRedirects: 0,
            validateStatus: function (status) {
              return status >= 200 && status < 300; // Accept only 2xx status codes
            }
          });
          
          console.log('S3 upload response status:', response.status);
          console.log('S3 upload response headers:', response.headers);
          console.log('ID image uploaded successfully to S3!');
        } catch (error) {
          console.error('ID image upload failed:', error);
          if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
            console.error('Response headers:', error.response.headers);
          }
          throw error;
        }
      }


      setProfilePictureName(profilePictureUrl?.data?.data?.originalFileName || null);
      setIdImageName(idImageUrl?.data?.data?.originalFileName || null);

      console.log('Form submitted:', formData);
      
      // Prepare data based on verification method (AFTER S3 uploads)
      const profilePictureS3Name = profilePictureUrl?.data?.data?.s3FileName || null;
      const profilePictureOriginalName = profilePictureUrl?.data?.data?.originalFileName || null;
      const idImageS3Name = idImageUrl?.data?.data?.s3FileName || null;
      const idImageOriginalName = idImageUrl?.data?.data?.originalFileName || null;
      
      console.log('profilePictureS3Name:', profilePictureS3Name);
      console.log('profilePictureOriginalName:', profilePictureOriginalName);
      console.log('idImageS3Name:', idImageS3Name);
      console.log('idImageOriginalName:', idImageOriginalName);
      
      // Build signup data with all fields
            const signupData = {
                username: formData.username,
                contactNumber: formData.contactNumber,
                password: formData.password,
                governmentIdType: formData.governmentIdType,
                idVerificationMethod: formData.idVerificationMethod,
        profilePicture: profilePictureS3Name,
        profilePictureOriginalName: profilePictureOriginalName,
                governmentId: formData.idVerificationMethod === 'number' ? formData.governmentId : null,
        idImage: formData.idVerificationMethod === 'image' ? idImageS3Name : null,
        idImageOriginalName: formData.idVerificationMethod === 'image' ? idImageOriginalName : null,
            };

            console.log('Final signup data being sent:', signupData);
      console.log('Profile picture S3 name:', profilePictureS3Name);
      console.log('Profile picture original name:', profilePictureOriginalName);
      console.log('ID image S3 name:', idImageS3Name);
      console.log('ID image original name:', idImageOriginalName);
      
      // Call signup API
      const signupResponse = await axios.post('http://localhost:3001/api/auth/signup', signupData);
      
      // Store user data in localStorage for homepage
      if (signupResponse.data.success) {
        const userData = {
          ...signupResponse.data.data,
          profilePicture: profilePictureS3Name,
          profilePictureOriginalName: profilePictureOriginalName,
          idImage: idImageS3Name,
          idImageOriginalName: idImageOriginalName,
        };
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Reset form after successful submission
        setFormData({
          username: '',
          contactNumber: '',
          password: '',
          governmentId: '',
          governmentIdType: 'Aadhaar',
          profilePicture: null,
          idVerificationMethod: 'number',
          idImage: null,
        });

        // Redirect to homepage
        window.location.href = '/home';
        return;
      }
        } catch (error) {
            console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

            let errorMessage = 'Registration failed. Please try again.';
            
            if (error.response?.data?.message) {
                if (error.response.data.message.includes('already exists')) {
          errorMessage = `User with this ${error.response.data.data?.field || 'information'} already exists. Please use different details.`;
        } else if (error.response.data.message.includes('Validation error')) {
          errorMessage = 'Please check your information and try again.';
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
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join Gen-Link and start your journey</p>
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
          <div style={{ marginTop: '15px' }}>
            <a 
              href="/users" 
              style={{ 
                color: '#667eea', 
                textDecoration: 'none',
                fontSize: '0.9em',
                fontWeight: '500'
              }}
            >
              👥 View All Registered Users
            </a>
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
              maxLength="20"
                                required
                            />
                        </div>

          <div className="form-group">
            <label htmlFor="contactNumber" className="form-label">Contact Number</label>
                            <input
                                type="tel"
                                id="contactNumber"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleChange}
              className="form-input"
              placeholder="Enter your phone number"
              maxLength="10"
              pattern="[0-9]{10}"
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
                            placeholder="Create a strong password"
              minLength="8"
              maxLength="50"
                            required
                        />
                    </div>

          <div className="form-group">
            <label htmlFor="governmentIdType" className="form-label">ID Type</label>
                        <select
                            id="governmentIdType"
                            name="governmentIdType"
                            value={formData.governmentIdType}
                            onChange={handleChange}
              className="form-select"
                            required
                        >
                            <option value="Aadhaar">Aadhaar Card</option>
                            <option value="PAN">PAN Card</option>
                            <option value="Voter ID">Voter ID</option>
                            <option value="Driving License">Driving License</option>
                        </select>
                    </div>

          <div className="form-group">
            <label className="form-label">ID Verification Method</label>
            <div className="verification-method-container">
              <label className="verification-option">
                <input
                  type="radio"
                  name="idVerificationMethod"
                  value="number"
                  checked={formData.idVerificationMethod === 'number'}
                  onChange={() => handleVerificationMethodChange('number')}
                />
                <span className="verification-label">Enter ID Number</span>
              </label>
              <label className="verification-option">
                <input
                  type="radio"
                  name="idVerificationMethod"
                  value="image"
                  checked={formData.idVerificationMethod === 'image'}
                  onChange={() => handleVerificationMethodChange('image')}
                />
                <span className="verification-label">Upload ID Image</span>
              </label>
                        </div>
                    </div>

                    {formData.idVerificationMethod === 'number' ? (
            <div className="form-group">
              <label htmlFor="governmentId" className="form-label">Government ID Number</label>
                            <input
                                type="text"
                                id="governmentId"
                                name="governmentId"
                                value={formData.governmentId}
                                onChange={handleChange}
                className="form-input"
                placeholder="Enter your ID number"
                minLength="10"
                maxLength="20"
                                required
                            />
                        </div>
                    ) : (
            <div className="form-group">
              <label htmlFor="idImage" className="form-label">Upload ID Image</label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="idImage"
                            name="idImage"
                  onChange={handleChange}
                  className="file-input"
                            accept="image/*"
                  required
                />
                <label htmlFor="idImage" className="file-input-label">
                  <span className="file-input-icon">🆔</span>
                  {formData.idImage ? formData.idImage.name : 'Choose ID image'}
                </label>
              </div>
              <p className="file-help-text">Upload a clear image of your {formData.governmentIdType.toLowerCase()}</p>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="profilePicture" className="form-label">Profile Picture</label>
            <div className="file-input-wrapper">
              <input
                type="file"
                id="profilePicture"
                        name="profilePicture"
                onChange={handleChange}
                className="file-input"
                        accept="image/*"
              />
              <label htmlFor="profilePicture" className="file-input-label">
                <span className="file-input-icon">📷</span>
                {formData.profilePicture ? formData.profilePicture.name : 'Choose profile picture'}
              </label>
            </div>
          </div>

                    <button 
                        type="submit" 
            className="submit-button"
                        disabled={isLoading}
                    >
            {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>
  )
}

export default AuthPage