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
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <div className="auth-header">
          <h1 className="auth-title">Welcome to Gen-Link! 🎉</h1>
          <p className="auth-subtitle">Your account has been created successfully</p>
        </div>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '30px',
          marginTop: '30px'
        }}>
          {/* Profile Image */}
          <div style={{ textAlign: 'center' }}>
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt="Profile"
                style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid #667eea',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                }}
              />
            ) : (
              <div
                style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  backgroundColor: '#e1e5e9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  color: '#666',
                  border: '4px solid #667eea',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                }}
              >
                👤
              </div>
            )}
          </div>

          {/* Welcome Message */}
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ 
              color: '#333', 
              margin: '0 0 10px 0',
              fontSize: '2rem',
              fontWeight: '600'
            }}>
              Hello, {user?.username}! 👋
            </h2>
            <p style={{ 
              color: '#666', 
              margin: '0 0 20px 0',
              fontSize: '1.1rem'
            }}>
              Welcome to the Gen-Link community!
            </p>
            
            {/* User Details */}
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '20px', 
              borderRadius: '10px',
              margin: '20px 0',
              border: '1px solid #e1e5e9'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Your Account Details</h3>
              <div style={{ display: 'grid', gap: '10px', textAlign: 'left' }}>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <strong>Username:</strong> {user?.username}
                </p>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <strong>Contact:</strong> {user?.contactNumber}
                </p>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <strong>ID Type:</strong> {user?.governmentIdType}
                </p>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <strong>Verification:</strong> {user?.idVerificationMethod === 'number' ? 'ID Number' : 'ID Image'}
                </p>
                {user?.idVerificationMethod === 'number' && user?.governmentId && (
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    <strong>ID Number:</strong> {user.governmentId}
                  </p>
                )}
                <p style={{ margin: '5px 0', color: '#666', fontSize: '0.9em' }}>
                  <strong>Joined:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '15px', 
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <button 
              onClick={handleViewUsers}
              className="submit-button"
              style={{ 
                backgroundColor: '#28a745',
                minWidth: '150px'
              }}
            >
              👥 View All Users
            </button>
            
            <button 
              onClick={() => window.location.href = '/'}
              className="submit-button"
              style={{ 
                backgroundColor: '#17a2b8',
                minWidth: '150px'
              }}
            >
              ➕ Add Another User
            </button>
            
            <button 
              onClick={handleLogout}
              className="submit-button"
              style={{ 
                backgroundColor: '#dc3545',
                minWidth: '150px'
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Success Message */}
        <div style={{ 
          marginTop: '30px',
          padding: '15px',
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0', color: '#155724', fontWeight: '500' }}>
            ✅ Your account is now active and ready to use!
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
