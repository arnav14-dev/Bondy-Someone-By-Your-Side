import React, { useState, useEffect } from 'react';
import { BASE_API_URL } from '../config/api.js';
import apiClient from '../utils/apiClient.js';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageUrls, setImageUrls] = useState({});


  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`${BASE_API_URL}/auth/users`);
      const data = response.data;
      
      if (data.success) {
        setUsers(data.data);
        // Fetch images for all users
        await fetchAllUserImages(data.data);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Error fetching users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUserImages = async (usersData) => {
    const imagePromises = [];
    const s3FileNames = [];

    // Collect all S3 file names that need to be fetched
    usersData.forEach(user => {
      if (user.profilePicture) {
        s3FileNames.push(user.profilePicture);
      }
      if (user.idImage) {
        s3FileNames.push(user.idImage);
      }
    });

    if (s3FileNames.length > 0) {
      try {
        const response = await fetch(`${BASE_API_URL}/s3/get-multiple-images-from-s3`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ s3FileNames }),
        });

        const data = await response.json();
        
        if (data.success) {
          const urlMap = {};
          data.data.forEach(item => {
            urlMap[item.s3FileName] = item.imageUrl;
          });
          setImageUrls(urlMap);
        }
      } catch (err) {
        console.error('Error fetching images:', err);
      }
    }
  };

  const getImageUrl = (s3FileName) => {
    return imageUrls[s3FileName] || null;
  };

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Loading Users...</h1>
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
              onClick={fetchUsers}
              className="submit-button"
              style={{ marginTop: '20px' }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card users-card">
        <div className="auth-header">
          <h1 className="auth-title">Registered Users</h1>
          <p className="auth-subtitle">View all registered users and their verification details</p>
        </div>

        <div className="users-content">
          {users.length === 0 ? (
            <p className="no-users-message">No users found.</p>
          ) : (
            <div className="users-grid">
              {users.map((user) => (
                <div key={user._id} className="user-card">
                  <div className="user-card-content">
                    {/* Profile Picture */}
                    <div className="user-profile-image">
                      {user.profilePicture && getImageUrl(user.profilePicture) ? (
                        <img
                          src={getImageUrl(user.profilePicture)}
                          alt="Profile"
                          className="profile-img"
                        />
                      ) : (
                        <div className="profile-placeholder-small">
                          👤
                        </div>
                      )}
                    </div>

                    {/* User Details */}
                    <div className="user-details">
                      <h3 className="user-name">
                        {user.username}
                      </h3>
                      <div className="user-info-grid">
                        <p className="user-info-item">
                          <strong>Contact:</strong> {user.contactNumber}
                        </p>
                        <p className="user-info-item">
                          <strong>ID Type:</strong> {user.governmentIdType}
                        </p>
                        <p className="user-info-item">
                          <strong>Verification:</strong> {user.idVerificationMethod === 'number' ? 'ID Number' : 'ID Image'}
                        </p>
                        
                        {user.idVerificationMethod === 'number' && user.governmentId && (
                          <p className="user-info-item">
                            <strong>ID Number:</strong> {user.governmentId}
                          </p>
                        )}

                        <p className="user-info-item user-info-small">
                          <strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* ID Image */}
                    {user.idVerificationMethod === 'image' && user.idImage && getImageUrl(user.idImage) && (
                      <div className="user-id-image">
                        <p className="id-image-label">
                          <strong>ID Image:</strong>
                        </p>
                        <img
                          src={getImageUrl(user.idImage)}
                          alt="ID Verification"
                          className="id-image"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="users-actions">
          <button 
            onClick={() => window.location.href = '/'}
            className="submit-button action-btn action-btn-primary"
          >
            Back to Registration
          </button>
          <button 
            onClick={() => window.location.href = '/login'}
            className="submit-button action-btn action-btn-info"
          >
            Login
          </button>
          <button 
            onClick={() => window.location.href = '/home'}
            className="submit-button action-btn action-btn-info"
          >
            Go to Homepage
          </button>
          <button 
            onClick={fetchUsers}
            className="submit-button action-btn action-btn-success"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
