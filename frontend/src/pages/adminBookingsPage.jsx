import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  MapPin, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  UserPlus
} from 'lucide-react';
import toast from 'react-hot-toast';
import AssignCompanionModal from '../components/AssignCompanionModal.jsx';
import '../styles/adminBookingsPage.css';

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    serviceType: '',
    city: '',
    dateFrom: '',
    dateTo: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalBookings: 0,
    hasNext: false,
    hasPrev: false
  });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [bookingToAssign, setBookingToAssign] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadBookings();
  }, [filters, pagination.currentPage]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams({
        page: pagination.currentPage,
        limit: 10,
        ...filters
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/bookings?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.data.bookings);
        setPagination(data.data.pagination);
      } else {
        toast.error('Failed to load bookings');
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Error loading bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  const handleAssignCompanion = (booking) => {
    setBookingToAssign(booking);
    setShowAssignModal(true);
  };

  const handleAssignSuccess = () => {
    loadBookings(); // Refresh the bookings list
  };

  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
    setBookingToAssign(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="status-icon pending" />;
      case 'confirmed':
        return <CheckCircle className="status-icon confirmed" />;
      case 'in_progress':
        return <Clock className="status-icon in-progress" />;
      case 'completed':
        return <CheckCircle className="status-icon completed" />;
      case 'cancelled':
        return <XCircle className="status-icon cancelled" />;
      default:
        return <AlertCircle className="status-icon pending" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'confirmed':
        return '#10b981';
      case 'in_progress':
        return '#3b82f6';
      case 'completed':
        return '#059669';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-bookings-page">
      {/* Header */}
      <div className="bookings-header">
        <div className="header-left">
          <button 
            className="back-btn"
            onClick={() => navigate('/admin/dashboard')}
          >
            <ArrowLeft size={20} />
          </button>
          <h1>Bookings Management</h1>
        </div>
        <div className="header-right">
          <button 
            className="filter-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
            Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-row">
            <div className="filter-group">
              <label>Search</label>
              <div className="search-input">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>
            <div className="filter-group">
              <label>Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Service Type</label>
              <select
                value={filters.serviceType}
                onChange={(e) => handleFilterChange('serviceType', e.target.value)}
              >
                <option value="">All Services</option>
                <option value="elderly-care">Elderly Care</option>
                <option value="shopping">Shopping</option>
                <option value="medical">Medical</option>
                <option value="social">Social</option>
                <option value="transportation">Transportation</option>
                <option value="household">Household</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="filter-row">
            <div className="filter-group">
              <label>City</label>
              <input
                type="text"
                placeholder="Enter city..."
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="bookings-stats">
        <div className="stat-card">
          <h3>Total Bookings</h3>
          <p>{pagination.totalBookings}</p>
        </div>
        <div className="stat-card">
          <h3>Current Page</h3>
          <p>{pagination.currentPage} of {pagination.totalPages}</p>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bookings-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading bookings...</p>
          </div>
        ) : bookings.length > 0 ? (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <div className="booking-id">
                    <span className="id-label">Booking ID:</span>
                    <span className="id-value">{booking._id.slice(-8)}</span>
                  </div>
                  <div className="booking-status">
                    {getStatusIcon(booking.status)}
                    <span 
                      className="status-text"
                      style={{ color: getStatusColor(booking.status) }}
                    >
                      {booking.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="booking-content">
                  <div className="booking-info">
                    <h3 className="task-description">{booking.taskDescription}</h3>
                    <div className="booking-details">
                    <div className="detail-item">
                      <User size={16} />
                      <span>{booking.userContact?.name || 'Unknown User'}</span>
                    </div>
                      <div className="detail-item">
                        <Calendar size={16} />
                        <span>Service: {formatDate(booking.date)} at {formatTime(booking.time)}</span>
                      </div>
                      <div className="detail-item">
                        <Clock size={16} />
                        <span>Booked: {formatDateTime(booking.createdAt)}</span>
                      </div>
                      <div className="detail-item">
                        <MapPin size={16} />
                        <span>{booking.location}</span>
                      </div>
                      <div className="detail-item">
                        <Clock size={16} />
                        <span>{booking.duration} hours</span>
                      </div>
                    </div>
                  </div>

                  <div className="booking-actions">
                    <div className="service-type">
                      <span className="service-badge">{booking.serviceType.replace('-', ' ').toUpperCase()}</span>
                    </div>
                    <div className="action-buttons">
                      {booking.status === 'pending' && !booking.assignedCompanion ? (
                        <button 
                          className="assign-btn"
                          onClick={() => handleAssignCompanion(booking)}
                          title="Assign Companion"
                        >
                          <UserPlus size={16} />
                          Assign Companion
                        </button>
                      ) : (
                        <div className="status-display">
                          <span 
                            className="status-text"
                            style={{ color: getStatusColor(booking.status) }}
                          >
                            {booking.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      )}
                      <button 
                        className="view-btn"
                        onClick={() => setSelectedBooking(booking)}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {booking.assignedCompanion && (
                  <div className="assigned-companion">
                    <div className="companion-info">
                      <div className="companion-avatar">
                        {booking.assignedCompanion.profilePicture ? (
                          <img 
                            src={booking.assignedCompanion.profilePicture} 
                            alt={booking.assignedCompanion.name}
                            className="avatar-image"
                          />
                        ) : (
                          <div className="avatar-placeholder">
                            {booking.assignedCompanion.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="companion-label">Assigned Companion:</span>
                        <span className="companion-name">{booking.assignedCompanion.name}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-bookings">
            <Calendar size={48} />
            <h3>No bookings found</h3>
            <p>No bookings match your current filters.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={!pagination.hasPrev}
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            className="pagination-btn"
            disabled={!pagination.hasNext}
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
          >
            Next
          </button>
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Booking Details</h2>
              <button 
                className="close-btn"
                onClick={() => setSelectedBooking(null)}
              >
                <XCircle size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Booking Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Booking ID:</strong>
                    <span>{selectedBooking._id}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Status:</strong>
                    <span style={{ color: getStatusColor(selectedBooking.status) }}>
                      {selectedBooking.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Service Type:</strong>
                    <span>{selectedBooking.serviceType.replace('-', ' ').toUpperCase()}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Duration:</strong>
                    <span>{selectedBooking.duration} hours</span>
                  </div>
                  <div className="detail-item">
                    <strong>Service Date & Time:</strong>
                    <span>{formatDate(selectedBooking.date)} at {formatTime(selectedBooking.time)}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Booked On:</strong>
                    <span>{formatDateTime(selectedBooking.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Location:</strong>
                    <span>{selectedBooking.location}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Task Description</h3>
                <p>{selectedBooking.taskDescription}</p>
              </div>

              {selectedBooking.specialRequirements && (
                <div className="detail-section">
                  <h3>Special Requirements</h3>
                  <p>{selectedBooking.specialRequirements}</p>
                </div>
              )}

              <div className="detail-section">
                <h3>User Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Name:</strong>
                    <span>{selectedBooking.userContact?.name || 'Unknown'}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Email:</strong>
                    <span>{selectedBooking.userContact?.email || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Mobile:</strong>
                    <span>{selectedBooking.userContact?.mobile || 'Unknown'}</span>
                  </div>
                  {selectedBooking.emergencyContact && (
                    <div className="detail-item">
                      <strong>Emergency Contact:</strong>
                      <span>{selectedBooking.emergencyContact}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedBooking.assignedCompanion && (
                <div className="detail-section">
                  <h3>Assigned Companion</h3>
                  <div className="companion-profile">
                    <div className="companion-avatar-large">
                      {selectedBooking.assignedCompanion.profilePicture ? (
                        <img 
                          src={selectedBooking.assignedCompanion.profilePicture} 
                          alt={selectedBooking.assignedCompanion.name}
                          className="avatar-image-large"
                        />
                      ) : (
                        <div className="avatar-placeholder-large">
                          {selectedBooking.assignedCompanion.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="companion-details">
                      <h4>{selectedBooking.assignedCompanion.name}</h4>
                    </div>
                  </div>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <strong>Name:</strong>
                      <span>{selectedBooking.assignedCompanion.name}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Email:</strong>
                      <span>{selectedBooking.assignedCompanion.email}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Mobile:</strong>
                      <span>{selectedBooking.assignedCompanion.mobile}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Specialties:</strong>
                      <span>{selectedBooking.assignedCompanion.specialties?.join(', ') || 'None'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Companion Modal */}
      {showAssignModal && bookingToAssign && (
        <AssignCompanionModal
          isOpen={showAssignModal}
          onClose={handleCloseAssignModal}
          booking={bookingToAssign}
          onSuccess={handleAssignSuccess}
        />
      )}
    </div>
  );
};

export default AdminBookingsPage;
