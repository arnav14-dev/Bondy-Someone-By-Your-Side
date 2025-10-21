import React, { useState, useEffect } from 'react';
import LocationSelector from '../components/LocationSelector';
import apiClient from '../utils/apiClient';
import '../styles/locationManagementPage.css';

const LocationManagementPage = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserLocations();
  }, []);

  const fetchUserLocations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/user-locations');
      if (response.data.success) {
        setLocations(response.data.data.locations);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      setError('Failed to load saved locations');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationAdded = (newLocation) => {
    setLocations(prev => [newLocation, ...prev]);
  };

  const handleLocationUpdated = (updatedLocation) => {
    setLocations(prev => 
      prev.map(loc => 
        loc._id === updatedLocation._id ? updatedLocation : loc
      )
    );
  };

  const handleLocationDeleted = (locationId) => {
    setLocations(prev => prev.filter(loc => loc._id !== locationId));
  };

  const handleSetDefault = async (locationId) => {
    try {
      const response = await apiClient.put(`/user-locations/${locationId}/default`);
      if (response.data.success) {
        // Update the locations to reflect the new default
        setLocations(prev => 
          prev.map(loc => ({
            ...loc,
            isDefault: loc._id === locationId
          }))
        );
      }
    } catch (error) {
      console.error('Error setting default location:', error);
      setError('Failed to set default location');
    }
  };

  if (loading) {
    return (
      <div className="location-management-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="location-management-page">
      <div className="page-header">
        <h1>Manage Your Locations</h1>
        <p>Save up to 3 locations for quick booking</p>
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="locations-container">
        <div className="saved-locations-section">
          <h2>Your Saved Locations</h2>
          {locations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📍</div>
              <h3>No locations saved yet</h3>
              <p>Add your first location to get started with quick bookings</p>
            </div>
          ) : (
            <div className="locations-grid">
              {locations.map((location) => (
                <div key={location._id} className="location-card">
                  <div className="location-header">
                    <h3>{location.name}</h3>
                    {location.isDefault && (
                      <span className="default-badge">Default</span>
                    )}
                  </div>
                  
                  <div className="location-details">
                    <p className="address">{location.address}</p>
                    {location.flatNumber && (
                      <p className="detail">Flat: {location.flatNumber}</p>
                    )}
                    {location.buildingName && (
                      <p className="detail">Building: {location.buildingName}</p>
                    )}
                    {location.landmark && (
                      <p className="detail">Landmark: {location.landmark}</p>
                    )}
                    <p className="area">
                      {location.area}, {location.city} - {location.pincode}
                    </p>
                  </div>

                  <div className="location-actions">
                    {!location.isDefault && (
                      <button 
                        onClick={() => handleSetDefault(location._id)}
                        className="set-default-btn"
                      >
                        Set as Default
                      </button>
                    )}
                    <button 
                      onClick={() => handleLocationUpdated(location)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleLocationDeleted(location._id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="add-location-section">
          <h2>Add New Location</h2>
          <LocationSelector 
            onLocationSelect={handleLocationAdded}
            showAddNew={true}
          />
        </div>
      </div>

      <div className="help-section">
        <h3>How it works</h3>
        <div className="help-steps">
          <div className="help-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Save Locations</h4>
              <p>Add up to 3 frequently used locations with complete address details</p>
            </div>
          </div>
          <div className="help-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Quick Booking</h4>
              <p>Select from saved locations when booking a Bondy service</p>
            </div>
          </div>
          <div className="help-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Auto-Select</h4>
              <p>Your most recently used location is automatically selected for new bookings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationManagementPage;
