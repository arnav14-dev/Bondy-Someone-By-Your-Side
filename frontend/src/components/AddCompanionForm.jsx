import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, MapPin, FileText, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { BASE_API_URL } from '../config/api.js';
import './AddCompanionForm.css';

const AddCompanionForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    age: '',
    gender: '',
    address: '',
    bio: '',
    specialties: ['General Care'],
    experience: '',
    hourlyRate: '',
    location: {
      city: '',
      state: '',
      pincode: ''
    },
    languages: ['English'],
    emergencyContact: {
      name: '',
      mobile: '',
      relation: ''
    }
  });

  const [files, setFiles] = useState({
    governmentProof: null,
    profilePicture: null
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
      setFiles(prev => ({
        ...prev,
        [name]: selectedFiles[0]
      }));
    }
  };

  const handleSpecialtyAdd = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const newSpecialty = e.target.value.trim();
      if (!formData.specialties.includes(newSpecialty)) {
        setFormData(prev => ({
          ...prev,
          specialties: [...prev.specialties, newSpecialty]
        }));
        e.target.value = '';
      }
    }
  };

  const handleSpecialtyRemove = (specialty) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
  };

  const handleLanguageAdd = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const newLanguage = e.target.value.trim();
      if (!formData.languages.includes(newLanguage)) {
        setFormData(prev => ({
          ...prev,
          languages: [...prev.languages, newLanguage]
        }));
        e.target.value = '';
      }
    }
  };

  const handleLanguageRemove = (language) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== language)
    }));
  };

  const uploadFile = async (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${BASE_API_URL}/api/cloudinary/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('File upload failed');
    }

    const result = await response.json();
    return result.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Upload files first
      let governmentProofData = null;
      let profilePictureData = null;

      if (files.governmentProof) {
        governmentProofData = await uploadFile(files.governmentProof, 'document');
      }

      if (files.profilePicture) {
        profilePictureData = await uploadFile(files.profilePicture, 'image');
      }

             // Prepare companion data
             const companionData = {
               ...formData,
               age: parseInt(formData.age),
               experience: parseInt(formData.experience),
               hourlyRate: parseInt(formData.hourlyRate),
               governmentProof: governmentProofData?.url || '',
               governmentProofOriginalName: governmentProofData?.originalName || '',
               governmentProofPublicId: governmentProofData?.publicId || '',
               profilePicture: profilePictureData?.url || '',
               profilePictureOriginalName: profilePictureData?.originalName || '',
               profilePicturePublicId: profilePictureData?.publicId || '',
               // Only include emergency contact if all fields are filled
               emergencyContact: (formData.emergencyContact.name && formData.emergencyContact.mobile && formData.emergencyContact.relation)
                 ? formData.emergencyContact
                 : undefined
             };

      // Submit companion data
      const response = await fetch(`${BASE_API_URL}/api/admin/companions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(companionData)
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.data && Array.isArray(result.data)) {
          // Validation errors
          const validationErrors = {};
          result.data.forEach(error => {
            validationErrors[error.path[0]] = error.message;
          });
          setErrors(validationErrors);
          return;
        }
        throw new Error(result.message || 'Failed to create companion');
      }

      toast.success('Companion added successfully!');
      onSuccess && onSuccess();
      onClose();

    } catch (error) {
      console.error('Error creating companion:', error);
      toast.error(error.message || 'Failed to create companion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-companion-overlay">
      <div className="add-companion-modal">
        <div className="add-companion-header">
          <h2>Add New Companion</h2>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-companion-form">
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">
                  <User size={16} />
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? 'error' : ''}
                  placeholder="Enter full name"
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <Mail size={16} />
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="Enter email address"
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="mobile">
                  <Phone size={16} />
                  Contact Number *
                </label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className={errors.mobile ? 'error' : ''}
                  placeholder="Enter contact number"
                />
                {errors.mobile && <span className="error-text">{errors.mobile}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="age">
                  <Calendar size={16} />
                  Age *
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className={errors.age ? 'error' : ''}
                  placeholder="Enter age"
                  min="18"
                  max="100"
                />
                {errors.age && <span className="error-text">{errors.age}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="gender">Gender *</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className={errors.gender ? 'error' : ''}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <span className="error-text">{errors.gender}</span>}
              </div>

              <div className="form-group full-width">
                <label htmlFor="address">
                  <MapPin size={16} />
                  Address *
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={errors.address ? 'error' : ''}
                  placeholder="Enter complete address"
                  rows="3"
                />
                {errors.address && <span className="error-text">{errors.address}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Profile & Documents</h3>
            <div className="form-grid">

              <div className="form-group">
                <label htmlFor="governmentProof">
                  <FileText size={16} />
                  Government Proof (Aadhaar) *
                </label>
                <input
                  type="file"
                  id="governmentProof"
                  name="governmentProof"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="file-input"
                />
                {files.governmentProof && (
                  <div className="file-preview">
                    <span>{files.governmentProof.name}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="profilePicture">
                  <User size={16} />
                  Profile Picture *
                </label>
                <input
                  type="file"
                  id="profilePicture"
                  name="profilePicture"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="file-input"
                />
                {files.profilePicture && (
                  <div className="file-preview">
                    <span>{files.profilePicture.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Professional Information</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="bio">Bio *</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className={errors.bio ? 'error' : ''}
                  placeholder="Tell us about the companion's background and experience"
                  rows="4"
                />
                {errors.bio && <span className="error-text">{errors.bio}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="specialties">Specialties *</label>
                <input
                  type="text"
                  id="specialties"
                  placeholder="Add specialty and press Enter"
                  onKeyPress={handleSpecialtyAdd}
                />
                <div className="tags">
                  {formData.specialties.map((specialty, index) => (
                    <span key={index} className="tag">
                      {specialty}
                      <button
                        type="button"
                        onClick={() => handleSpecialtyRemove(specialty)}
                        className="tag-remove"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                {errors.specialties && <span className="error-text">{errors.specialties}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="experience">Experience (years) *</label>
                <input
                  type="number"
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className={errors.experience ? 'error' : ''}
                  placeholder="Years of experience"
                  min="0"
                />
                {errors.experience && <span className="error-text">{errors.experience}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="hourlyRate">Hourly Rate (₹) *</label>
                <input
                  type="number"
                  id="hourlyRate"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleInputChange}
                  className={errors.hourlyRate ? 'error' : ''}
                  placeholder="Hourly rate in rupees"
                  min="0"
                />
                {errors.hourlyRate && <span className="error-text">{errors.hourlyRate}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Location</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="location.city">City *</label>
                <input
                  type="text"
                  id="location.city"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleInputChange}
                  className={errors['location.city'] ? 'error' : ''}
                  placeholder="Enter city"
                />
                {errors['location.city'] && <span className="error-text">{errors['location.city']}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="location.state">State *</label>
                <input
                  type="text"
                  id="location.state"
                  name="location.state"
                  value={formData.location.state}
                  onChange={handleInputChange}
                  className={errors['location.state'] ? 'error' : ''}
                  placeholder="Enter state"
                />
                {errors['location.state'] && <span className="error-text">{errors['location.state']}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="location.pincode">Pincode *</label>
                <input
                  type="text"
                  id="location.pincode"
                  name="location.pincode"
                  value={formData.location.pincode}
                  onChange={handleInputChange}
                  className={errors['location.pincode'] ? 'error' : ''}
                  placeholder="Enter pincode"
                />
                {errors['location.pincode'] && <span className="error-text">{errors['location.pincode']}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Languages</h3>
            <div className="form-group">
              <input
                type="text"
                placeholder="Add language and press Enter"
                onKeyPress={handleLanguageAdd}
              />
              <div className="tags">
                {formData.languages.map((language, index) => (
                  <span key={index} className="tag">
                    {language}
                    <button
                      type="button"
                      onClick={() => handleLanguageRemove(language)}
                      className="tag-remove"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Emergency Contact</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="emergencyContact.name">Contact Name</label>
                <input
                  type="text"
                  id="emergencyContact.name"
                  name="emergencyContact.name"
                  value={formData.emergencyContact.name}
                  onChange={handleInputChange}
                  placeholder="Emergency contact name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="emergencyContact.mobile">Contact Mobile</label>
                <input
                  type="tel"
                  id="emergencyContact.mobile"
                  name="emergencyContact.mobile"
                  value={formData.emergencyContact.mobile}
                  onChange={handleInputChange}
                  placeholder="Emergency contact mobile"
                />
              </div>

              <div className="form-group">
                <label htmlFor="emergencyContact.relation">Relation</label>
                <input
                  type="text"
                  id="emergencyContact.relation"
                  name="emergencyContact.relation"
                  value={formData.emergencyContact.relation}
                  onChange={handleInputChange}
                  placeholder="Relation to companion"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? 'Adding...' : 'Add Companion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCompanionForm;
