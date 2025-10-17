import React, { useState, useEffect } from 'react';
import '../styles/bookingsPage.css';
import apiClient from '../utils/apiClient.js';
import { getApiEndpoint } from '../config/api.js';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

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
    console.log('User data from localStorage:', userData);
    if (userData) {
      const parsedUser = JSON.parse(userData);
      console.log('Parsed user:', parsedUser);
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
      console.log('Fetching bookings from:', url);
      
      const response = await apiClient.get(url);
      console.log('Bookings API response:', response.data);
      
      if (response.data.success) {
        const bookings = response.data.data.bookings || [];
        console.log('Bookings found:', bookings.length);
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
      pending: '⏳',
      confirmed: '✅',
      'in-progress': '🔄',
      completed: '🎉',
      cancelled: '❌'
    };
    return icons[status] || '❓';
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
      'elderly-care': '👴',
      'shopping': '🛒',
      'medical': '🏥',
      'social': '☕',
      'transportation': '🚗',
      'household': '🏠',
      'other': '🤝'
    };
    return icons[serviceType] || '🤝';
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
        <Navbar user={user} onLogout={handleLogout} />
        <main className="main-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your bookings...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bookings-page">
      <Navbar user={user} onLogout={handleLogout} />
      
      <main className="main-content">


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
                      <span className="error-icon">⚠️</span>
                      {error}
                    </div>
                  )}

                  {bookings.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📅</div>
                      <h3>No bookings found</h3>
                      <p>You haven't made any companion bookings yet.</p>
                      <a href="/home" className="cta-button">Book a Companion</a>
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
                      <div className="stat-icon">📅</div>
                      <div className="stat-info">
                        <span className="stat-number">{stats.totalBookings || 0}</span>
                        <span className="stat-label">Total</span>
                      </div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-icon">✅</div>
                      <div className="stat-info">
                        <span className="stat-number">{stats.completedBookings || 0}</span>
                        <span className="stat-label">Completed</span>
                      </div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-icon">⏳</div>
                      <div className="stat-info">
                        <span className="stat-number">{stats.pendingBookings || 0}</span>
                        <span className="stat-label">Pending</span>
                      </div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-icon">⭐</div>
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

      <Footer />
    </div>
  );
};

export default BookingsPage;
