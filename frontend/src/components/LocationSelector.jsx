import React, { useState, useEffect } from 'react';
import apiClient from '../utils/apiClient';
import './LocationSelector.css';

const LocationSelector = ({ onLocationSelect, selectedLocation, showAddNew = true }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [canAddMore, setCanAddMore] = useState(true);

  // Form state for new location
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    flatNumber: '',
    buildingName: '',
    landmark: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    coordinates: { latitude: null, longitude: null }
  });

  useEffect(() => {
    fetchUserLocations();
  }, []);

  const fetchUserLocations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/user-locations');
      if (response.data.success) {
        setLocations(response.data.data.locations);
        setCanAddMore(response.data.data.canAddMore);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      setError('Failed to load saved locations');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    setLocationError(null);
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        
        try {
          // Reverse geocoding to get address
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${import.meta.env.VITE_OPENCAGE_API_KEY || 'f82dc198cbc546eaa25c9cf5b7a9e75f'}`
          );
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            const result = data.results[0];
            const components = result.components;
            
            setFormData(prev => ({
              ...prev,
              coordinates: { latitude, longitude },
              address: result.formatted,
              area: components.suburb || components.city_district || '',
              city: components.city || components.town || '',
              state: components.state || '',
              pincode: components.postcode || ''
            }));
          }
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
          setFormData(prev => ({
            ...prev,
            coordinates: { latitude, longitude }
          }));
        }
        
        setLoading(false);
      },
      (error) => {
        setLocationError(`Error getting location: ${error.message}`);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveLocation = async () => {
    try {
      if (!formData.name || !formData.address || !formData.coordinates.latitude) {
        setError('Please fill in all required fields');
        return;
      }

      const response = await apiClient.post('/user-locations', formData);
      if (response.data.success) {
        setLocations(prev => [response.data.data, ...prev]);
        setCanAddMore(locations.length + 1 < 3);
        setShowAddForm(false);
        setFormData({
          name: '',
          address: '',
          flatNumber: '',
          buildingName: '',
          landmark: '',
          area: '',
          city: '',
          state: '',
          pincode: '',
          coordinates: { latitude: null, longitude: null }
        });
        setError(null);
      }
    } catch (error) {
      console.error('Error saving location:', error);
      setError('Failed to save location');
    }
  };

  const handleLocationSelect = (location) => {
    onLocationSelect(location);
  };

  const handleEditLocation = (location) => {
    setFormData(location);
    setShowAddForm(true);
  };

  const handleDeleteLocation = async (locationId) => {
    try {
      await apiClient.delete(`/user-locations/${locationId}`);
      setLocations(prev => prev.filter(loc => loc._id !== locationId));
      setCanAddMore(true);
    } catch (error) {
      console.error('Error deleting location:', error);
      setError('Failed to delete location');
    }
  };

  return (
    <div className="location-selector">
      <h3>Select Location</h3>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <span>Loading...</span>
        </div>
      )}

      {/* Saved Locations */}
      {locations.length > 0 && (
        <div className="saved-locations">
          <h4>Saved Locations</h4>
          {locations.map((location) => (
            <div 
              key={location._id} 
              className={`location-card ${selectedLocation?._id === location._id ? 'selected' : ''}`}
              onClick={() => handleLocationSelect(location)}
            >
              <div className="location-info">
                <h5>{location.name}</h5>
                <p>{location.address}</p>
                {location.flatNumber && <p>Flat: {location.flatNumber}</p>}
                {location.buildingName && <p>Building: {location.buildingName}</p>}
                <p>{location.area}, {location.city} - {location.pincode}</p>
              </div>
              <div className="location-actions">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditLocation(location);
                  }}
                  className="edit-btn"
                >
                  Edit
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteLocation(location._id);
                  }}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Location */}
      {showAddNew && canAddMore && (
        <div className="add-location">
          {!showAddForm ? (
            <button 
              onClick={() => setShowAddForm(true)}
              className="add-location-btn"
            >
              + Add New Location
            </button>
          ) : (
            <div className="add-location-form">
              <h4>Add New Location</h4>
              
              <div className="form-group">
                <button 
                  onClick={getCurrentLocation}
                  className="get-location-btn"
                  disabled={loading}
                >
                  📍 Use Current Location
                </button>
                {locationError && (
                  <div className="error-message">{locationError}</div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Location Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Home, Office"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Full Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Complete address"
                  rows="3"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Flat/House Number</label>
                  <input
                    type="text"
                    name="flatNumber"
                    value={formData.flatNumber}
                    onChange={handleInputChange}
                    placeholder="A-101"
                  />
                </div>
                <div className="form-group">
                  <label>Building Name</label>
                  <input
                    type="text"
                    name="buildingName"
                    value={formData.buildingName}
                    onChange={handleInputChange}
                    placeholder="Apartment Name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Landmark</label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  placeholder="Nearby landmark"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Area *</label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder="Area/Locality"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="123456"
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  onClick={handleSaveLocation}
                  className="save-btn"
                  disabled={!formData.name || !formData.address || !formData.coordinates.latitude}
                >
                  Save Location
                </button>
                <button 
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({
                      name: '',
                      address: '',
                      flatNumber: '',
                      buildingName: '',
                      landmark: '',
                      area: '',
                      city: '',
                      state: '',
                      pincode: '',
                      coordinates: { latitude: null, longitude: null }
                    });
                    setError(null);
                  }}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!canAddMore && (
        <div className="max-locations-message">
          You have reached the maximum limit of 3 saved locations.
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
