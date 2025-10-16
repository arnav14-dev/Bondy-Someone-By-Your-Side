import React, { useState, useEffect } from 'react';
import '../styles/authPage.css';

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const BASE_API_URL = 'http://localhost:3001/api';

  useEffect(() => {
    // Get user data from localStorage (set during signup)
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Fetch profile image if user has one
      if (parsedUser.profilePicture) {
        fetchProfileImage(parsedUser.profilePicture);
      } else {
        setLoading(false);
      }
    } else {
      setError('No user data found. Please sign up first.');
      setLoading(false);
    }
  }, []);

  const fetchProfileImage = async (s3FileName) => {
    try {
      const response = await fetch(`${BASE_API_URL}/s3/get-image-from-s3`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ s3FileName }),
      });

      const data = await response.json();
      
      if (data.success) {
        setProfileImageUrl(data.data.imageUrl);
      }
    } catch (err) {
      console.error('Error fetching profile image:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/';
  };

  const handleViewUsers = () => {
    window.location.href = '/users';
  };

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Loading...</h1>
            <p className="auth-subtitle">Welcome to Gen-Link</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Error</h1>
            <p style={{ color: '#c33' }}>{error}</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="submit-button"
              style={{ marginTop: '20px' }}
            >
              Go to Signup
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card home-card">
        <div className="auth-header">
          <h1 className="auth-title">Welcome to Gen-Link! 🎉</h1>
          <p className="auth-subtitle">Your account has been created successfully</p>
        </div>

        <div className="home-content">
          {/* Profile Image */}
          <div className="profile-image-container">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt="Profile"
                className="profile-image"
              />
            ) : (
              <div className="profile-placeholder">
                👤
              </div>
            )}
          </div>

          {/* Welcome Message */}
          <div className="welcome-section">
            <h2 className="welcome-title">
              Hello, {user?.username}! 👋
            </h2>
            <p className="welcome-subtitle">
              Welcome to the Gen-Link community!
            </p>
            
            {/* User Details */}
            <div className="user-details-card">
              <h3 className="details-title">Your Account Details</h3>
              <div className="details-grid">
                <p className="detail-item">
                  <strong>Username:</strong> {user?.username}
                </p>
                <p className="detail-item">
                  <strong>Contact:</strong> {user?.contactNumber}
                </p>
                <p className="detail-item">
                  <strong>ID Type:</strong> {user?.governmentIdType}
                </p>
                <p className="detail-item">
                  <strong>Verification:</strong> {user?.idVerificationMethod === 'number' ? 'ID Number' : 'ID Image'}
                </p>
                {user?.idVerificationMethod === 'number' && user?.governmentId && (
                  <p className="detail-item">
                    <strong>ID Number:</strong> {user.governmentId}
                  </p>
                )}
                <p className="detail-item detail-small">
                  <strong>Joined:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              onClick={handleViewUsers}
              className="submit-button action-btn action-btn-success"
            >
              👥 View All Users
            </button>
            
            <button 
              onClick={() => window.location.href = '/'}
              className="submit-button action-btn action-btn-info"
            >
              ➕ Add Another User
            </button>
            
            <button 
              onClick={handleLogout}
              className="submit-button action-btn action-btn-danger"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Success Message */}
        <div className="success-message">
          <p className="success-text">
            ✅ Your account is now active and ready to use!
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
