import React, { useState, useEffect } from 'react';
import '../styles/authPage.css';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageUrls, setImageUrls] = useState({});

  const BASE_API_URL = 'http://localhost:3001/api';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_API_URL}/auth/users`);
      const data = await response.json();
      
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
      <div className="auth-card" style={{ maxWidth: '800px' }}>
        <div className="auth-header">
          <h1 className="auth-title">Registered Users</h1>
          <p className="auth-subtitle">View all registered users and their verification details</p>
        </div>

        <div style={{ marginTop: '20px' }}>
          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {users.map((user) => (
                <div 
                  key={user._id} 
                  style={{ 
                    border: '1px solid #e1e5e9', 
                    borderRadius: '8px', 
                    padding: '20px',
                    backgroundColor: '#f8f9fa'
                  }}
                >
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    {/* Profile Picture */}
                    <div style={{ flexShrink: 0 }}>
                      {user.profilePicture && getImageUrl(user.profilePicture) ? (
                        <img
                          src={getImageUrl(user.profilePicture)}
                          alt="Profile"
                          style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid #667eea'
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            backgroundColor: '#e1e5e9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            color: '#666'
                          }}
                        >
                          👤
                        </div>
                      )}
                    </div>

                    {/* User Details */}
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                        {user.username}
                      </h3>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Contact:</strong> {user.contactNumber}
                      </p>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>ID Type:</strong> {user.governmentIdType}
                      </p>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Verification:</strong> {user.idVerificationMethod === 'number' ? 'ID Number' : 'ID Image'}
                      </p>
                      
                      {user.idVerificationMethod === 'number' && user.governmentId && (
                        <p style={{ margin: '5px 0', color: '#666' }}>
                          <strong>ID Number:</strong> {user.governmentId}
                        </p>
                      )}

                      <p style={{ margin: '5px 0', color: '#666', fontSize: '0.9em' }}>
                        <strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* ID Image */}
                    {user.idVerificationMethod === 'image' && user.idImage && getImageUrl(user.idImage) && (
                      <div style={{ flexShrink: 0 }}>
                        <p style={{ margin: '0 0 10px 0', fontSize: '0.9em', color: '#666' }}>
                          <strong>ID Image:</strong>
                        </p>
                        <img
                          src={getImageUrl(user.idImage)}
                          alt="ID Verification"
                          style={{
                            width: '120px',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            border: '1px solid #ddd'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <button 
            onClick={() => window.location.href = '/'}
            className="submit-button"
            style={{ marginRight: '10px' }}
          >
            Back to Registration
          </button>
          <button 
            onClick={() => window.location.href = '/home'}
            className="submit-button"
            style={{ marginRight: '10px', backgroundColor: '#17a2b8' }}
          >
            Go to Homepage
          </button>
          <button 
            onClick={fetchUsers}
            className="submit-button"
            style={{ backgroundColor: '#28a745' }}
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
