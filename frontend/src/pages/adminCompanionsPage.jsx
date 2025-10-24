import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye, CheckCircle, XCircle, FileText } from 'lucide-react';
import AddCompanionForm from '../components/AddCompanionForm.jsx';
import { BASE_API_URL } from '../config/api.js';
import '../styles/adminCompanionsPage.css';

const AdminCompanionsPage = () => {
  const [companions, setCompanions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCompanion, setSelectedCompanion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    city: '',
    specialty: '',
    isActive: '',
    isVerified: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCompanions: 0,
    hasNext: false,
    hasPrev: false
  });

  useEffect(() => {
    loadCompanions();
  }, [searchTerm, filters, pagination.currentPage]);

  const loadCompanions = async () => {
    try {
      setIsLoading(true);

      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        console.error('No admin token found');
        return;
      }

      const queryParams = new URLSearchParams({
        page: pagination.currentPage,
        limit: 10,
        search: searchTerm,
        ...filters
      });

      const response = await fetch(`${BASE_API_URL}/api/admin/companions?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load companions');
      }

      const result = await response.json();
      const companions = result.data.companions;
      
      // Cloudinary URLs work directly, no need for pre-signed URLs
      setCompanions(companions);
      setPagination(result.data.pagination);
    } catch (error) {
      console.error('Error loading companions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleToggleStatus = async (companionId, currentStatus) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`${BASE_API_URL}/api/admin/companions/${companionId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Reload companions to get updated data
      loadCompanions();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleVerify = async (companionId, currentVerificationStatus) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`${BASE_API_URL}/api/admin/companions/${companionId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ isVerified: !currentVerificationStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update verification status');
      }

      // Reload companions to get updated data
      loadCompanions();
    } catch (error) {
      console.error('Error updating verification status:', error);
    }
  };

  const handleAddSuccess = () => {
    loadCompanions();
  };

  const handleViewCompanion = async (companion) => {
    console.log('Viewing companion:', companion);
    console.log('Government proof URL:', companion.governmentProof);
    console.log('Government proof original name:', companion.governmentProofOriginalName);
    console.log('Government proof public ID:', companion.governmentProofPublicId);
    
    // Cloudinary URLs work directly, no need for pre-signed URLs
    // Just set the companion data and show the modal
    setSelectedCompanion(companion);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedCompanion(null);
  };

  return (
    <div className="admin-companions-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Companion Management</h1>
          <p>Manage and monitor companion profiles</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          <Plus size={20} />
          Add New Companion
        </button>
      </div>

      <div className="filters-section">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search companions..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="filters">
          <select
            value={filters.city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
          >
            <option value="">All Cities</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi">Delhi</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Chennai">Chennai</option>
          </select>
          
          <select
            value={filters.specialty}
            onChange={(e) => handleFilterChange('specialty', e.target.value)}
          >
            <option value="">All Specialties</option>
            <option value="General Care">General Care</option>
            <option value="Elderly Care">Elderly Care</option>
            <option value="Medical Assistance">Medical Assistance</option>
            <option value="Companionship">Companionship</option>
          </select>
          
          <select
            value={filters.isActive}
            onChange={(e) => handleFilterChange('isActive', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          
          <select
            value={filters.isVerified}
            onChange={(e) => handleFilterChange('isVerified', e.target.value)}
          >
            <option value="">All Verification</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
        </div>
      </div>

      <div className="companions-list-section">
        {isLoading ? (
          <p>Loading companions...</p>
        ) : companions.length === 0 ? (
          <p>No companions found.</p>
        ) : (
          <table className="companions-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Location</th>
                <th>Specialties</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companions.map((companion) => (
                <tr key={companion._id}>
                  <td>
                    <div className="companion-info">
                      <div className="avatar">
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
                      <div>
                        <div className="name">{companion.name}</div>
                        <div className="email">{companion.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      <div className="mobile">{companion.mobile}</div>
                    </div>
                  </td>
                  <td>{companion.age}</td>
                  <td className="gender">{companion.gender}</td>
                  <td>
                    <div className="location-info">
                      <div className="city">{companion.location?.city}</div>
                      <div className="state">{companion.location?.state}</div>
                    </div>
                  </td>
                  <td>
                    <div className="specialties">
                      {companion.specialties?.slice(0, 2).map((specialty, index) => (
                        <span key={index} className="specialty-tag">
                          {specialty}
                        </span>
                      ))}
                      {companion.specialties?.length > 2 && (
                        <span className="specialty-more">
                          +{companion.specialties.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="status-badges">
                      <span className={`status-badge ${companion.isActive ? 'active' : 'inactive'}`}>
                        {companion.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className={`verification-badge ${companion.isVerified ? 'verified' : 'unverified'}`}>
                        {companion.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        onClick={() => handleViewCompanion(companion)}
                        className="action-btn view"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button className="action-btn edit" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(companion._id, companion.isActive)}
                        className={`action-btn ${companion.isActive ? 'deactivate' : 'activate'}`}
                        title={companion.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {companion.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                      </button>
                      <button
                        onClick={() => handleVerify(companion._id, companion.isVerified)}
                        className={`action-btn ${companion.isVerified ? 'unverify' : 'verify'}`}
                        title={companion.isVerified ? 'Mark as Unverified' : 'Mark as Verified'}
                      >
                        {companion.isVerified ? <XCircle size={16} /> : <CheckCircle size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="pagination-btn"
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNext}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}

      {showAddForm && (
        <AddCompanionForm
          onClose={() => setShowAddForm(false)}
          onSuccess={handleAddSuccess}
        />
      )}

      {showViewModal && selectedCompanion && (
        <div className="modal-overlay">
          <div className="modal-content view-modal">
            <div className="modal-header">
              <h2>Companion Details</h2>
              <button onClick={handleCloseViewModal} className="close-btn">
                <XCircle size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="companion-details">
                <div className="detail-section">
                  <div className="profile-section">
                    <div className="avatar-large">
                      {selectedCompanion.profilePicture ? (
                        <img 
                          src={selectedCompanion.profilePicture} 
                          alt={selectedCompanion.name}
                          className="avatar-image-large"
                        />
                      ) : (
                        <div className="avatar-placeholder-large">
                          {selectedCompanion.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="profile-info">
                      <h3>{selectedCompanion.name}</h3>
                      <p className="email">{selectedCompanion.email}</p>
                      <div className="status-badges">
                        <span className={`status-badge ${selectedCompanion.isActive ? 'active' : 'inactive'}`}>
                          {selectedCompanion.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className={`verification-badge ${selectedCompanion.isVerified ? 'verified' : 'unverified'}`}>
                          {selectedCompanion.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Contact Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Mobile</label>
                      <span>{selectedCompanion.mobile}</span>
                    </div>
                    <div className="detail-item">
                      <label>Age</label>
                      <span>{selectedCompanion.age} years</span>
                    </div>
                    <div className="detail-item">
                      <label>Gender</label>
                      <span className="gender">{selectedCompanion.gender}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Location</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Address</label>
                      <span>{selectedCompanion.address}</span>
                    </div>
                    <div className="detail-item">
                      <label>City</label>
                      <span>{selectedCompanion.location?.city}</span>
                    </div>
                    <div className="detail-item">
                      <label>State</label>
                      <span>{selectedCompanion.location?.state}</span>
                    </div>
                    <div className="detail-item">
                      <label>Pincode</label>
                      <span>{selectedCompanion.location?.pincode}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Professional Details</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Specialties</label>
                      <div className="specialties">
                        {selectedCompanion.specialties?.map((specialty, index) => (
                          <span key={index} className="specialty-tag">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="detail-item">
                      <label>Experience</label>
                      <span>{selectedCompanion.experience} years</span>
                    </div>
                    <div className="detail-item">
                      <label>Hourly Rate</label>
                      <span>₹{selectedCompanion.hourlyRate}/hour</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Bio</h4>
                  <p className="bio-text">{selectedCompanion.bio}</p>
                </div>

                {selectedCompanion.languages && selectedCompanion.languages.length > 0 && (
                  <div className="detail-section">
                    <h4>Languages</h4>
                    <div className="languages">
                      {selectedCompanion.languages.map((language, index) => (
                        <span key={index} className="language-tag">
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCompanion.emergencyContact && (
                  <div className="detail-section">
                    <h4>Emergency Contact</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>Name</label>
                        <span>{selectedCompanion.emergencyContact.name}</span>
                      </div>
                      <div className="detail-item">
                        <label>Mobile</label>
                        <span>{selectedCompanion.emergencyContact.mobile}</span>
                      </div>
                      <div className="detail-item">
                        <label>Relation</label>
                        <span>{selectedCompanion.emergencyContact.relation}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="detail-section">
                  <h4>Government Proof</h4>
                  {(selectedCompanion.governmentProofPublicId && selectedCompanion.governmentProofPublicId !== '') || (selectedCompanion.governmentProof && selectedCompanion.governmentProof !== '') ? (
                    <div className="document-section">
                      <p className="document-info">
                        <strong>Document:</strong> {selectedCompanion.governmentProofOriginalName || 'Government Proof Document'}
                      </p>
                      <div className="document-actions">
                        <a 
                          href={selectedCompanion.governmentProof} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="document-link"
                          onClick={(e) => {
                            // Check if URL is valid before opening
                            const documentUrl = selectedCompanion.governmentProof;
                            if (!documentUrl || documentUrl === '' || !documentUrl.startsWith('http')) {
                              e.preventDefault();
                              alert('Document URL is not available or invalid');
                              console.error('Invalid document URL:', documentUrl);
                            } else {
                              console.log('Opening document URL:', documentUrl);
                            }
                          }}
                        >
                          <FileText size={16} />
                          View Document
                        </a>
                        <button 
                          className="document-copy-btn"
                          onClick={() => {
                            const documentUrl = selectedCompanion.governmentProof;
                            if (documentUrl) {
                              navigator.clipboard.writeText(documentUrl);
                              alert('Document URL copied to clipboard');
                            } else {
                              alert('No document URL available');
                            }
                          }}
                          title="Copy document URL"
                        >
                          Copy URL
                        </button>
                      </div>
                      <div className="document-preview">
                        <small className="document-url">
                          {selectedCompanion.governmentProofPublicId ? 'Cloudinary Public ID: ' + selectedCompanion.governmentProofPublicId :
                           'Direct URL'}
                        </small>
                      </div>
                    </div>
                  ) : (
                    <div className="no-document">
                      <p className="no-document-text">
                        <FileText size={20} />
                        No government proof document uploaded
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={handleCloseViewModal} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCompanionsPage;
