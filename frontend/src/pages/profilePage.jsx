import React, { useState, useEffect } from 'react';
import '../styles/profilePage.css';
import apiClient from '../utils/apiClient.js';
import { BASE_API_URL } from '../config/api.js';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchUserData();
    fetchStats();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`${BASE_API_URL}/auth/me`);
      
      if (response.data.success) {
        const userData = response.data.data;
        setUser(userData);
        setFormData({
          username: userData.username || '',
          contactNumber: userData.contactNumber || '',
          governmentIdType: userData.governmentIdType || '',
          governmentId: userData.governmentId || ''
        });
        
        // Fetch profile image
        if (userData.profilePicture) {
          fetchProfileImage(userData.profilePicture);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileImage = async (s3FileName) => {
    try {
      const response = await fetch(`${BASE_API_URL}/s3/get-image-from-s3`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': user?._id || ''
        },
        body: JSON.stringify({ s3FileName }),
      });

      const data = await response.json();
      
      if (data.success) {
        setProfileImageUrl(data.data.imageUrl);
      }
    } catch (err) {
      console.error('Error fetching profile image:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get(`${BASE_API_URL}/bookings/stats`);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Here you would typically update the user profile
      // For now, we'll just show a success message
      alert('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      contactNumber: user?.contactNumber || '',
      governmentIdType: user?.governmentIdType || '',
      governmentId: user?.governmentId || ''
    });
    setEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="profile-page">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="main-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Navbar user={user} onLogout={handleLogout} />
      
      <main className="main-content">
        {/* Header Section */}
        <section className="profile-header">
          <div className="container">
            <h1 className="page-title">My Profile</h1>
            <p className="page-subtitle">Manage your account and preferences</p>
          </div>
        </section>

        <div className="profile-content">
          <div className="container">
            <div className="profile-layout">
              {/* Profile Card */}
              <div className="profile-card">
                <div className="profile-image-section">
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
                  <button className="edit-image-btn">
                    📷 Change Photo
                  </button>
                </div>

                <div className="profile-info">
                  <h2 className="profile-name">{user?.username ? user.username.split(' ')[0].substring(0, 10) : 'User'}</h2>
                  <p className="profile-email">{user?.contactNumber}</p>
                  <div className="profile-badges">
                    <span className="badge verified">✅ Verified User</span>
                    <span className="badge member">🤝 Companion Member</span>
                  </div>
                </div>

                <div className="profile-actions">
                  <button
                    className="action-btn primary"
                    onClick={() => setEditing(!editing)}
                  >
                    {editing ? 'Cancel' : '✏️ Edit Profile'}
                  </button>
                  {editing && (
                    <button
                      className="action-btn success"
                      onClick={handleSave}
                    >
                      💾 Save Changes
                    </button>
                  )}
                </div>
              </div>

              {/* Stats Card */}
              <div className="stats-card">
                <h3 className="card-title">Your Activity</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-icon">📅</div>
                    <div className="stat-content">
                      <span className="stat-number">{stats.totalBookings || 0}</span>
                      <span className="stat-label">Total Bookings</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                      <span className="stat-number">{stats.completedBookings || 0}</span>
                      <span className="stat-label">Completed</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-content">
                      <span className="stat-number">{stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}</span>
                      <span className="stat-label">Avg Rating</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="details-card">
                <h3 className="card-title">Profile Details</h3>
                <div className="details-form">
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    {editing ? (
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    ) : (
                      <p className="form-value">{user?.username}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contact Number</label>
                    {editing ? (
                      <input
                        type="tel"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    ) : (
                      <p className="form-value">{user?.contactNumber}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">ID Type</label>
                    {editing ? (
                      <select
                        name="governmentIdType"
                        value={formData.governmentIdType}
                        onChange={handleInputChange}
                        className="form-select"
                      >
                        <option value="">Select ID Type</option>
                        <option value="Aadhar">Aadhar Card</option>
                        <option value="PAN">PAN Card</option>
                        <option value="Driving License">Driving License</option>
                        <option value="Passport">Passport</option>
                      </select>
                    ) : (
                      <p className="form-value">{user?.governmentIdType || 'Not provided'}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">ID Number</label>
                    {editing ? (
                      <input
                        type="text"
                        name="governmentId"
                        value={formData.governmentId}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    ) : (
                      <p className="form-value">{user?.governmentId ? '••••••••••' : 'Not provided'}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Verification Method</label>
                    <p className="form-value">
                      {user?.idVerificationMethod === 'number' ? 'ID Number' : 'ID Image'}
                    </p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Member Since</label>
                    <p className="form-value">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="actions-card">
                <h3 className="card-title">Quick Actions</h3>
                <div className="action-buttons">
                  <a href="/home" className="action-link">
                    <span className="action-icon">🏠</span>
                    <span className="action-text">Book a Companion</span>
                  </a>
                  <a href="/bookings" className="action-link">
                    <span className="action-icon">📅</span>
                    <span className="action-text">View Bookings</span>
                  </a>
                  <a href="#" className="action-link">
                    <span className="action-icon">⚙️</span>
                    <span className="action-text">Settings</span>
                  </a>
                  <a href="#" className="action-link">
                    <span className="action-icon">📞</span>
                    <span className="action-text">Support</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
