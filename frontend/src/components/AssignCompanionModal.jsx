import React, { useState, useEffect } from 'react';
import { XCircle, User, Phone, MapPin, Star, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { BASE_API_URL } from '../config/api.js';
import './AssignCompanionModal.css';

const AssignCompanionModal = ({ isOpen, onClose, booking, onSuccess }) => {
  const [companions, setCompanions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedCompanion, setSelectedCompanion] = useState(null);

  useEffect(() => {
    if (isOpen && booking) {
      loadAvailableCompanions();
    }
  }, [isOpen, booking]);

  const loadAvailableCompanions = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams({
        date: booking.date,
        time: booking.time,
        city: booking.location,
        serviceType: booking.serviceType
      });

      const response = await fetch(`${BASE_API_URL}/api/admin/bookings/available-companions?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Available companions API response:', result);
        console.log('Setting companions:', result.data.companions);
        setCompanions(result.data.companions);
      } else {
        const errorResult = await response.json();
        console.error('Failed to load companions:', errorResult);
        toast.error('Failed to load available companions');
      }
    } catch (error) {
      console.error('Error loading companions:', error);
      toast.error('Error loading companions');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCompanion = async () => {
    if (!selectedCompanion) {
      toast.error('Please select a companion');
      return;
    }

    try {
      setAssigning(true);

      const response = await fetch(`${BASE_API_URL}/api/admin/bookings/${booking._id}/assign-companion`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ companionId: selectedCompanion._id })
      });

      if (response.ok) {
        toast.success('Companion assigned successfully!');
        onSuccess && onSuccess();
        onClose();
      } else {
        const result = await response.json();
        toast.error(result.message || 'Failed to assign companion');
      }
    } catch (error) {
      console.error('Error assigning companion:', error);
      toast.error('Error assigning companion');
    } finally {
      setAssigning(false);
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

  if (!isOpen || !booking) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content assign-companion-modal">
        <div className="modal-header">
          <h2>Assign Companion</h2>
          <button onClick={onClose} className="close-btn">
            <XCircle size={24} />
          </button>
        </div>

        <div className="modal-body">
          {/* Booking Details */}
          <div className="booking-summary">
            <h3>Booking Details</h3>
            <div className="booking-info">
              <div className="info-item">
                <strong>Service:</strong> {booking.serviceType.replace('-', ' ').toUpperCase()}
              </div>
              <div className="info-item">
                <strong>Date & Time:</strong> {formatDate(booking.date)} at {formatTime(booking.time)}
              </div>
              <div className="info-item">
                <strong>Duration:</strong> {booking.duration} hours
              </div>
              <div className="info-item">
                <strong>Location:</strong> {booking.location}
              </div>
              <div className="info-item">
                <strong>User:</strong> {booking.userContact?.name} ({booking.userContact?.mobile})
              </div>
            </div>
          </div>

          {/* Available Companions */}
          <div className="companions-section">
            <h3>Available Companions</h3>
            
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading available companions...</p>
              </div>
            ) : companions.length > 0 ? (
              <div className="companions-list">
                {companions.map((companion) => (
                  <div 
                    key={companion._id} 
                    className={`companion-card ${selectedCompanion?._id === companion._id ? 'selected' : ''}`}
                    onClick={() => setSelectedCompanion(companion)}
                  >
                    <div className="companion-header">
                      <div className="companion-avatar">
                        {companion.profilePicture ? (
                          <img 
                            src={companion.profilePicture} 
                            alt={companion.name}
                            className="avatar-image"
                          />
                        ) : (
                          <div className="avatar-placeholder">
                            {companion.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="companion-info">
                        <h4>{companion.name}</h4>
                        <div className="companion-rating">
                          <Star size={16} fill="#fbbf24" color="#fbbf24" />
                          <span>{companion.rating?.average || 'New'}</span>
                        </div>
                      </div>
                      <div className="companion-rate">
                        <span className="rate">₹{companion.hourlyRate}/hr</span>
                      </div>
                    </div>

                    <div className="companion-details">
                      <div className="detail-item">
                        <Phone size={14} />
                        <span>{companion.mobile}</span>
                      </div>
                      <div className="detail-item">
                        <MapPin size={14} />
                        <span>{companion.location?.city}, {companion.location?.state}</span>
                      </div>
                      <div className="detail-item">
                        <Clock size={14} />
                        <span>{companion.specialties?.join(', ') || 'General Care'}</span>
                      </div>
                    </div>

                    {companion.bio && (
                      <div className="companion-bio">
                        <p>{companion.bio}</p>
                      </div>
                    )}

                    {selectedCompanion?._id === companion._id && (
                      <div className="selected-indicator">
                        <CheckCircle size={20} color="#10b981" />
                        <span>Selected</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-companions">
                <User size={48} />
                <h4>No Available Companions</h4>
                <p>No companions are available for this date and time.</p>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button 
            onClick={onClose} 
            className="btn-secondary"
            disabled={assigning}
          >
            Cancel
          </button>
          <button 
            onClick={handleAssignCompanion}
            className="btn-primary"
            disabled={!selectedCompanion || assigning}
          >
            {assigning ? 'Assigning...' : 'Assign Companion'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignCompanionModal;
