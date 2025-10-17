import React, { useState, useEffect } from 'react';
import '../styles/CompanionBookingForm.css';
import { BASE_API_URL } from '../config/api.js';
import apiClient from '../utils/apiClient.js';

const CompanionBookingForm = ({ user }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Service Details
    serviceCategory: '',
    date: '',
    time: '',
    location: '',
    specialRequirements: '',
    
    // Step 2: Contact Details
    contactName: user?.username || '',
    contactNumber: user?.contactNumber || ''
  });

  const [errors, setErrors] = useState({});

  // Scroll to top when component mounts
  useEffect(() => {
    scrollToTop();
  }, []);

  const serviceCategories = [
    { value: 'elderly-care', label: 'Elderly Companionship', icon: '👴' },
    { value: 'shopping', label: 'Errands & Groceries', icon: '🛒' },
    { value: 'medical', label: 'Medical Appointments', icon: '🏥' },
    { value: 'other', label: 'Technology Help', icon: '💻' },
    { value: 'social', label: 'Social Outings', icon: '☕' },
    { value: 'household', label: 'Administrative Tasks', icon: '📋' }
  ];


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };


  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.serviceCategory) newErrors.serviceCategory = 'Please select a service category';
    if (!formData.date) newErrors.date = 'Please select a date';
    if (!formData.time) newErrors.time = 'Please select a time';
    if (!formData.location.trim()) newErrors.location = 'Please enter location';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.contactName.trim()) newErrors.contactName = 'Please enter your name';
    if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Please enter your phone number';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const scrollToTop = () => {
    // Try multiple scroll methods to ensure it works
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Also try scrolling the main content area
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const saveBookingToDatabase = async () => {
    try {
      const bookingData = {
        serviceType: formData.serviceCategory,
        taskDescription: formData.specialRequirements || 'No specific requirements mentioned',
        duration: '2', // Default duration since we removed it from form
        date: formData.date,
        time: formData.time,
        location: formData.location,
        specialRequirements: formData.specialRequirements,
        emergencyContact: formData.contactNumber,
        urgency: 'normal' // Default urgency
      };

      const response = await apiClient.post(`${BASE_API_URL}/bookings`, bookingData);
      
      if (response.data.success) {
        console.log('Booking saved to database:', response.data.data);
        return response.data.data;
      } else {
        console.error('Failed to save booking:', response.data.message);
        return null;
      }
    } catch (error) {
      console.error('Error saving booking to database:', error);
      return null;
    }
  };

  const handleNext = async () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
      setTimeout(() => scrollToTop(), 100);
    } else if (currentStep === 2 && validateStep2()) {
      setIsSubmitting(true);
      try {
        // Save to database first, then proceed to step 3
        const savedBooking = await saveBookingToDatabase();
        if (savedBooking) {
          setCurrentStep(3);
          setTimeout(() => scrollToTop(), 100);
        } else {
          // If database save fails, still proceed to step 3 but show warning
          console.warn('Booking saved to WhatsApp but not to database');
          setCurrentStep(3);
          setTimeout(() => scrollToTop(), 100);
        }
      } catch (error) {
        console.error('Error in booking process:', error);
        // Still proceed to step 3 even if database save fails
        setCurrentStep(3);
        setTimeout(() => scrollToTop(), 100);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setTimeout(() => scrollToTop(), 100);
    }
  };

  const handleWhatsAppRedirect = () => {
    let message = `Hi! I just submitted a booking request and need a companion. Here are my details:

Service: ${serviceCategories.find(s => s.value === formData.serviceCategory)?.label}
Date: ${formData.date}
Time: ${formData.time}
Location: ${formData.location}`;

    if (formData.specialRequirements.trim()) {
      message += `\nSpecial Requirements: ${formData.specialRequirements}`;
    }

    message += `\nContact: ${formData.contactName} (${formData.contactNumber})

Please confirm my booking. Thank you!`;

    const whatsappUrl = `https://wa.me/917559466990?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const resetForm = () => {
    setFormData({
      serviceCategory: '',
      date: '',
      time: '',
      location: '',
      specialRequirements: '',
      contactName: user?.username || '',
      contactNumber: user?.contactNumber || ''
    });
    setCurrentStep(1);
    setErrors({});
    setTimeout(() => scrollToTop(), 100);
  };

  return (
    <div className="booking-form-container">
      <div className="booking-form-header">
        <h2 className="booking-title">Book a Companion</h2>
        <p className="booking-subtitle">
          Tell us about your needs and we'll match you with the perfect companion
        </p>
        
        {/* Step Indicator */}
        <div className="step-indicator">
          <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Service</span>
          </div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Contact</span>
          </div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Confirm</span>
          </div>
        </div>
      </div>

      <div className="booking-form-content">
        {/* Step 1: Service Details */}
        {currentStep === 1 && (
          <div className="form-step">
            <h3 className="step-title">1. What do you need help with?</h3>
            
            {/* Service Category */}
            <div className="form-section">
              <div className="service-category-grid">
                {serviceCategories.map(category => (
                  <label key={category.value} className="service-category-option">
                    <input
                      type="radio"
                      name="serviceCategory"
                      value={category.value}
                      checked={formData.serviceCategory === category.value}
                      onChange={handleChange}
                      className="service-radio"
                    />
                    <div className="service-card">
                      <span className="service-icon">{category.icon}</span>
                      <span className="service-label">{category.label}</span>
                    </div>
                  </label>
                ))}
              </div>
              {errors.serviceCategory && <span className="error-message">{errors.serviceCategory}</span>}
            </div>

            {/* Date, Time, Location */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <span className="label-text">Date</span>
                  <span className="label-required">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="form-input"
                />
                {errors.date && <span className="error-message">{errors.date}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-text">Time</span>
                  <span className="label-required">*</span>
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="form-input"
                />
                {errors.time && <span className="error-message">{errors.time}</span>}
              </div>
            </div>

            {/* Location */}
            <div className="form-section">
              <label className="form-label">
                <span className="label-text">Where do you need help?</span>
                <span className="label-required">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter your address or area"
                className="form-input"
              />
              {errors.location && <span className="error-message">{errors.location}</span>}
            </div>

            {/* Special Requirements */}
            <div className="form-section">
              <label className="form-label">
                <span className="label-text">Special Requirements (Optional)</span>
              </label>
              <textarea
                name="specialRequirements"
                value={formData.specialRequirements}
                onChange={handleChange}
                placeholder="e.g., Must speak Hindi, Experience with Child Care, Male/Female Companion, etc."
                className="form-textarea"
                rows="3"
              />
            </div>
          </div>
        )}

        {/* Step 2: Contact Details */}
        {currentStep === 2 && (
          <div className="form-step">
            <h3 className="step-title">2. How can we reach you?</h3>
            <p className="step-subtitle">We've pre-filled your details, but you can change them if booking for someone else.</p>
            
            {/* Contact Details */}
            <div className="form-section">
              <div className="form-group">
                <label className="form-label">
                  <span className="label-text">Your Name</span>
                  <span className="label-required">*</span>
                </label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="form-input"
                />
                {errors.contactName && <span className="error-message">{errors.contactName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-text">Phone Number</span>
                  <span className="label-required">*</span>
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="form-input"
                />
                {errors.contactNumber && <span className="error-message">{errors.contactNumber}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Success & WhatsApp Handoff */}
        {currentStep === 3 && (
          <div className="form-step success-step">
            <div className="success-content">
              <div className="success-icon">✅</div>
              <h3 className="success-title">3. Your request is submitted!</h3>
              <p className="success-message">
                Thank you! We have received your request and are currently finding the perfect verified companion for you. Our matching process is personal to ensure the best fit.
              </p>
              
              <div className="whatsapp-section">
                <h4 className="whatsapp-title">→ Confirm your request on WhatsApp.</h4>
                <p className="whatsapp-instruction">
                  For the fastest match and to finalize your booking, please click the button below to send the service details to our booking manager.
                </p>
                
                <button 
                  onClick={handleWhatsAppRedirect}
                  className="whatsapp-button"
                >
                  <span className="whatsapp-icon">💬</span>
                  Chat with Bondy Now
                </button>
                
                <p className="trust-assurance">
                  Your booking details are secure. A Bondy manager will confirm your request and assign your companion within 2 hours.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        {currentStep < 3 && (
          <div className="form-actions">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="btn-secondary"
              >
                Previous
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner"></span>
                  Saving...
                </>
              ) : (
                currentStep === 1 ? 'Next →' : 'Submit →'
              )}
            </button>
          </div>
        )}

        {/* Reset Button for Step 3 */}
        {currentStep === 3 && (
          <div className="form-actions">
            <button
              type="button"
              onClick={resetForm}
              className="btn-secondary"
            >
              Book Another Service
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanionBookingForm;