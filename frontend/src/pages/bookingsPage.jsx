import React, { useState, useEffect } from 'react';
import '../styles/bookingsPage.css';
import apiClient from '../utils/apiClient.js';
import { getApiEndpoint } from '../config/api.js';

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({});
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }
    
    fetchBookings();
    fetchStats();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const url = getApiEndpoint(`/bookings${params}`);
      
      const response = await apiClient.get(url);
      
      if (response.data.success) {
        const bookings = response.data.data.bookings || [];
        setBookings(bookings);
      } else {
        console.error('API returned error:', response.data.message);
        setError('Failed to fetch bookings');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to fetch bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get(getApiEndpoint('/bookings/stats'));
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const response = await apiClient.patch(getApiEndpoint(`/bookings/${bookingId}/cancel`));
      if (response.data.success) {
        fetchBookings();
        fetchStats();
        alert('Booking cancelled successfully');
      } else {
        alert('Failed to cancel booking');
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f39c12',
      confirmed: '#3498db',
      'in-progress': '#9b59b6',
      completed: '#27ae60',
      cancelled: '#e74c3c'
    };
    return colors[status] || '#95a5a6';
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
      ),
      confirmed: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 12l2 2 4-4"/>
          <circle cx="12" cy="12" r="10"/>
        </svg>
      ),
      'in-progress': (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 11-6.219-8.56"/>
        </svg>
      ),
      completed: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 12l2 2 4-4"/>
          <circle cx="12" cy="12" r="10"/>
        </svg>
      ),
      cancelled: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      )
    };
    return icons[status] || (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getServiceIcon = (serviceType) => {
    const icons = {
      'elderly-care': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          <path d="M6 21v-2a4 4 0 0 1 4-4h.5"/>
        </svg>
      ),
      'shopping': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
      ),
      'medical': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 21h18"/>
          <path d="M5 21V7l8-4v18"/>
          <path d="M19 21V11l-6-4"/>
          <path d="M9 9v.01"/>
          <path d="M9 12v.01"/>
          <path d="M9 15v.01"/>
          <path d="M9 18v.01"/>
        </svg>
      ),
      'social': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      'transportation': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18.7 9H5.3L4.5 11.1c-.8.2-1.5 1-1.5 1.9v3c0 .6.4 1 1 1h2"/>
          <circle cx="7" cy="18" r="2"/>
          <circle cx="17" cy="18" r="2"/>
          <path d="M8 18h8"/>
        </svg>
      ),
      'household': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9,22 9,12 15,12 15,22"/>
        </svg>
      ),
      'other': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      )
    };
    return icons[serviceType] || (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    );
  };

  const getServiceName = (serviceType) => {
    const names = {
      'elderly-care': 'Elderly Care & Assistance',
      'shopping': 'Shopping & Errands',
      'medical': 'Medical Appointments',
      'social': 'Social Companionship',
      'transportation': 'Transportation',
      'household': 'Household Tasks',
      'other': 'Other Services'
    };
    return names[serviceType] || 'Other Services';
  };

  if (loading) {
    return (
      <div className="bookings-page">
        <main className="main-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your bookings...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bookings-page">
      <main className="bookings-main-content">


        {/* Main Content Section */}
        <section className="main-content-section">
          <div className="container">
            <div className="content-layout">
              {/* Bookings List - Main Content */}
              <div className="bookings-main">
                {/* Filter Section */}
                <div className="filter-section">
                  <div className="filter-controls">
                    <h3>Filter by Status:</h3>
                    <div className="filter-buttons">
                      {['all', 'pending', 'confirmed', 'in-progress', 'completed', 'cancelled'].map(status => (
                        <button
                          key={status}
                          className={`filter-btn ${filter === status ? 'active' : ''}`}
                          onClick={() => setFilter(status)}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bookings List */}
                <div className="bookings-list">
                  {error && (
                    <div className="error-message">
                      <span className="error-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                          <line x1="12" y1="9" x2="12" y2="13"/>
                          <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                      </span>
                      {error}
                    </div>
                  )}

                  {bookings.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                      </div>
                      <h3>No bookings found</h3>
                      <p>You haven't made any companion bookings yet.</p>
                      <a href="/booking" className="cta-button">Book a Companion</a>
                    </div>
                  ) : (
                    <div className="bookings-grid">
                {bookings.map(booking => (
                  <div key={booking._id} className="booking-card">
                    <div className="booking-header">
                      <div className="service-info">
                        <span className="service-icon">{getServiceIcon(booking.serviceType)}</span>
                        <div className="service-details">
                          <h3 className="service-name">{getServiceName(booking.serviceType)}</h3>
                          <p className="booking-date">
                            {formatDate(booking.date)} at {formatTime(booking.time)}
                          </p>
                        </div>
                      </div>
                      <div className="booking-status">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(booking.status) }}
                        >
                          {getStatusIcon(booking.status)} {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('-', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="booking-content">
                      <p className="task-description">{booking.taskDescription}</p>
                      
                      <div className="booking-details">
                        <div className="detail-item">
                          <span className="detail-label">Duration:</span>
                          <span className="detail-value">{booking.duration} hour{booking.duration !== '1' ? 's' : ''}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Location:</span>
                          <span className="detail-value">{booking.location}</span>
                        </div>
                        {booking.assignedCompanion && (
                          <div className="detail-item">
                            <span className="detail-label">Companion:</span>
                            <span className="detail-value">{booking.assignedCompanion.username}</span>
                          </div>
                        )}
                        {booking.budget && (
                          <div className="detail-item">
                            <span className="detail-label">Budget:</span>
                            <span className="detail-value">${booking.budget}/hour</span>
                          </div>
                        )}
                      </div>

                      {booking.specialRequirements && (
                        <div className="special-requirements">
                          <h4>Special Requirements:</h4>
                          <p>{booking.specialRequirements}</p>
                        </div>
                      )}
                    </div>

                    <div className="booking-actions">
                      {booking.canBeCancelled && booking.status !== 'cancelled' && (
                        <button
                          className="action-btn cancel-btn"
                          onClick={() => cancelBooking(booking._id)}
                        >
                          Cancel Booking
                        </button>
                      )}
                      <button className="action-btn view-btn">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Card - Sidebar */}
              <div className="stats-sidebar">
                <div className="stats-card">
                  <h3 className="stats-title">Quick Stats</h3>
                  <div className="stats-content">
                    <div className="stat-item">
                      <div className="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                      </div>
                      <div className="stat-info">
                        <span className="stat-number">{stats.totalBookings || 0}</span>
                        <span className="stat-label">Total</span>
                      </div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 12l2 2 4-4"/>
                          <circle cx="12" cy="12" r="10"/>
                        </svg>
                      </div>
                      <div className="stat-info">
                        <span className="stat-number">{stats.completedBookings || 0}</span>
                        <span className="stat-label">Completed</span>
                      </div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12,6 12,12 16,14"/>
                        </svg>
                      </div>
                      <div className="stat-info">
                        <span className="stat-number">{stats.pendingBookings || 0}</span>
                        <span className="stat-label">Pending</span>
                      </div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                        </svg>
                      </div>
                      <div className="stat-info">
                        <span className="stat-number">{stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}</span>
                        <span className="stat-label">Avg Rating</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default BookingsPage;
