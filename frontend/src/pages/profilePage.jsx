import React, { useState, useEffect } from 'react';
import '../styles/profilePage.css';
import apiClient from '../utils/apiClient.js';
import { BASE_API_URL } from '../config/api.js';
import Footer from '../components/Footer.jsx';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
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
        console.log('User data received:', userData);
        setUser(userData);
        setFormData({
          username: userData.username || '',
          contactNumber: userData.contactNumber || ''
        });
        
        // Profile picture functionality removed
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
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
      const response = await apiClient.put(`${BASE_API_URL}/auth/update-profile`, formData);
      
      if (response.data.success) {
        // Update the user state with new data
        setUser(prevUser => ({
          ...prevUser,
          ...formData
        }));
        alert('Profile updated successfully!');
        setEditing(false);
      } else {
        alert('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      contactNumber: user?.contactNumber || ''
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
        <main className="main-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your profile...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <main className="profile-main-content">
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
                  <div className="profile-image-wrapper">
                    <div className="profile-image-container">
                      <div className="profile-placeholder">
                        👤
                      </div>
                    </div>
                    <div className="verification-badge">
                      ✓
                    </div>
                  </div>
                  <div className="profile-name-container"> 
                    <h2 className="profile-name">{user?.username ? user.username.split(' ')[0].substring(0, 10) : 'User'}</h2>
                    <p className="profile-email">{user?.contactNumber}</p>
                  </div>
                </div>

                  <div className="profile-info">
                  </div>

                <div className="profile-actions">
                  <button
                    className="action-btn primary"
                    onClick={() => setEditing(!editing)}
                  >
                    {editing ? 'Cancel' : 'Edit Profile'}
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
                    <div className="stat-content">
                      <span className="stat-number">{stats.totalBookings || 0}</span>
                      <span className="stat-label">Total Bookings</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-content">
                      <span className="stat-number">{stats.completedBookings || 0}</span>
                      <span className="stat-label">Completed</span>
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
                        placeholder="Enter your username"
                      />
                    ) : (
                      <p className="form-value">{user?.username || 'Not set'}</p>
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
                        placeholder="Enter your contact number"
                      />
                    ) : (
                      <p className="form-value">{user?.contactNumber || 'Not provided'}</p>
                    )}
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
                    <span className="action-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9,22 9,12 15,12 15,22"/>
                      </svg>
                    </span>
                    <span className="action-text">Book a Companion</span>
                  </a>
                  <a href="/bookings" className="action-link">
                    <span className="action-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    </span>
                    <span className="action-text">View Bookings</span>
                  </a>
                  <a href="#" className="action-link">
                    <span className="action-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                      </svg>
                    </span>
                    <span className="action-text">Settings</span>
                  </a>
                  <a href="#" className="action-link">
                    <span className="action-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                    </span>
                    <span className="action-text">Support</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
