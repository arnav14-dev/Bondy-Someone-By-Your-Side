import React, { useState, useEffect } from 'react';
import '../styles/CompanionBookingForm.css';
import { BASE_API_URL } from '../config/api.js';
import apiClient from '../utils/apiClient.js';
import LocationSelector from './LocationSelector.jsx';
import PaymentPage from './PaymentPage.jsx';
import SubServiceModal from './SubServiceModal.jsx';

const CompanionBookingForm = ({ user }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedBooking, setSavedBooking] = useState(null);
  const [showSubServiceModal, setShowSubServiceModal] = useState(false);
  const [selectedSubServices, setSelectedSubServices] = useState([]);
  const [formData, setFormData] = useState({
    // Step 1: Service Details
    serviceCategory: '',
    date: '',
    time: '',
    location: '',
    locationDetails: null, // Full location object from LocationSelector
    specialRequirements: '',
    
    // Step 2: Contact Details
    contactName: user?.username || '',
    contactNumber: user?.contactNumber || ''
  });

  const [errors, setErrors] = useState({});

  // Calculate minimum time (10 minutes from now)
  const getMinTime = () => {
    const now = new Date();
    const minTime = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now
    return minTime.toTimeString().slice(0, 5); // Format as HH:MM
  };

  // Scroll to top when component mounts
  useEffect(() => {
    scrollToTop();
  }, []);

  // Load most recent location on component mount
  useEffect(() => {
    const loadRecentLocation = async () => {
      try {
        const response = await apiClient.get('/user-locations/recent');
        if (response.data.success && response.data.data) {
          const recentLocation = response.data.data;
          setFormData(prev => ({
            ...prev,
            locationDetails: recentLocation,
            location: recentLocation.address
          }));
        }
      } catch (error) {
        // Silently handle 404 errors - user just needs to add a location
        if (error.response?.status !== 404) {
          console.log('Error loading recent location:', error);
        }
      }
    };

    loadRecentLocation();
  }, []);


  // Sub-service configurations for each main service
  const subServiceConfig = {
    'household': ['Meal Service', 'Event Setup', 'Home Organization', 'Kitchenware Cleaning'],
    'elderly-care': ['Personal Care', 'Walk Assist'],
    'shopping': ['Grocery Shopping (Upto 10kg)', 'General Errands (Within 5km)'],
    'medical': ['Doctor Visits', 'Pharmacy Trips', 'Night Stay', 'Therapy Sessions', 'Emergency Care'],
    'other': ['Pick-up & Drop Off (Distance Basis)', 'Playground Supervision (Hourly basis)', 'Baby Sitting (Hourly basis)'],
  };

  const serviceCategories = [
    { 
      value: 'elderly-care', 
      label: 'Elderly Companionship', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          <path d="M6 21v-2a4 4 0 0 1 4-4h.5"/>
        </svg>
      )
    },
    { 
      value: 'shopping', 
      label: 'Errands & Groceries', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
      )
    },
    { 
      value: 'medical', 
      label: 'Medical Support', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 21h18"/>
          <path d="M5 21V7l8-4v18"/>
          <path d="M19 21V11l-6-4"/>
          <path d="M9 9v.01"/>
          <path d="M9 12v.01"/>
          <path d="M9 15v.01"/>
          <path d="M9 18v.01"/>
        </svg>
      )
    },
    { 
      value: 'other', 
      label: 'Kid\'s Escort & Care', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z"/>
          <path d="M21 9V7L15 5.5V7L21 9Z"/>
          <path d="M3 9V7L9 5.5V7L3 9Z"/>
          <path d="M12 8C8.7 8 6 10.7 6 14V16H18V14C18 10.7 15.3 8 12 8Z"/>
          <path d="M8 20H16"/>
          <path d="M10 18V20"/>
          <path d="M14 18V20"/>
          <circle cx="9" cy="12" r="1"/>
          <circle cx="15" cy="12" r="1"/>
          <path d="M12 13V15"/>
        </svg>
      )
    },
    { 
      value: 'household', 
      label: 'Household Assistant', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9,22 9,12 15,12 15,22"/>
        </svg>
      )
    }
  ];


  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value
    };
    
    setFormData(newFormData);
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Real-time validation for date and time
    if (name === 'date' || name === 'time') {
      validateDateTime(newFormData);
    }
  };

  const handleServiceCategoryChange = (value) => {
    setFormData(prev => ({
      ...prev,
      serviceCategory: value
    }));
    
    // Check if this service has sub-services
    if (subServiceConfig[value]) {
      setShowSubServiceModal(true);
    } else {
      setSelectedSubServices([]);
    }
  };

  const handleSubServiceConfirm = (subServices) => {
    setSelectedSubServices(subServices);
    setFormData(prev => ({
      ...prev,
      subServices: subServices
    }));
  };

  // Real-time validation for date and time
  const validateDateTime = (currentFormData = formData) => {
    if (currentFormData.date && currentFormData.time) {
      const selectedDateTime = new Date(`${currentFormData.date}T${currentFormData.time}`);
      const now = new Date();
      const minBookingTime = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now
      
      if (selectedDateTime <= now) {
        setErrors(prev => ({
          ...prev,
          time: 'Booking time must be in the future'
        }));
      } else if (selectedDateTime < minBookingTime) {
        setErrors(prev => ({
          ...prev,
          time: 'Booking must be at least 10 minutes ahead of current time'
        }));
      } else {
        // Clear time error if validation passes
        setErrors(prev => ({
          ...prev,
          time: ''
        }));
      }
    }
  };

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      locationDetails: location,
      location: location.address
    }));
    
    // Clear location error
    if (errors.location) {
      setErrors(prev => ({
        ...prev,
        location: ''
      }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.serviceCategory) newErrors.serviceCategory = 'Please select a service category';
    if (!formData.date) newErrors.date = 'Please select a date';
    if (!formData.time) newErrors.time = 'Please select a time';
    if (!formData.locationDetails) newErrors.location = 'Please select a location';
    
    // Validate sub-services - user must select at least one if the service has sub-services
    if (formData.serviceCategory && subServiceConfig[formData.serviceCategory]) {
      if (!selectedSubServices || selectedSubServices.length === 0) {
        newErrors.subServices = 'Please select at least one sub-service';
      }
    }
    
    // Validate date and time are not in the past and at least 10 minutes ahead
    if (formData.date && formData.time) {
      const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
      const now = new Date();
      const minBookingTime = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now
      
      if (selectedDateTime <= now) {
        newErrors.time = 'Booking time must be in the future';
      } else if (selectedDateTime < minBookingTime) {
        newErrors.time = 'Booking must be at least 10 minutes ahead of current time';
      }
    }
    
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
        locationDetails: formData.locationDetails,
        specialRequirements: formData.specialRequirements,
        urgency: 'normal' // Default urgency
      };

      const response = await apiClient.post('/bookings', bookingData);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        console.error('Failed to save booking');
        return null;
      }
    } catch (error) {
      console.error('Error saving booking to database');
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
        // Save to database first, then proceed to payment
        const booking = await saveBookingToDatabase();
        if (booking) {
          setSavedBooking(booking);
          setCurrentStep(3); // Go to payment step
          setTimeout(() => scrollToTop(), 100);
        } else {
          // If database save fails, still proceed to step 3 but show warning
          console.warn('Booking saved to WhatsApp but not to database');
          setCurrentStep(3);
          setTimeout(() => scrollToTop(), 100);
        }
      } catch (error) {
        console.error('Error in booking process');
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

  const handlePaymentComplete = (paymentDetails) => {
    // Payment completed, proceed to success step
    setCurrentStep(4);
    setTimeout(() => scrollToTop(), 100);
  };

  const handleBackToBooking = () => {
    setCurrentStep(2);
    setTimeout(() => scrollToTop(), 100);
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
      locationDetails: null,
      specialRequirements: '',
      contactName: user?.username || '',
      contactNumber: user?.contactNumber || ''
    });
    setSavedBooking(null);
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
            <span className="step-label">Payment</span>
          </div>
          <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
            <span className="step-number">4</span>
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
                      onChange={(e) => handleServiceCategoryChange(e.target.value)}
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

            {/* Selected Sub-Services Display */}
            {selectedSubServices.length > 0 && (
              <div className="form-section">
                <label className="form-label">
                  <span className="label-text">Selected Sub-Services</span>
                </label>
                <div className="sub-services-display">
                  {selectedSubServices.map((subService, index) => (
                    <span key={index} className="sub-service-tag">
                      {subService}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-Services Error Display */}
            {errors.subServices && (
              <div className="form-section">
                <span className="error-message">{errors.subServices}</span>
              </div>
            )}

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
                  min={formData.date === new Date().toISOString().split('T')[0] ? getMinTime() : undefined}
                  className="form-input"
                />
                {errors.time && <span className="error-message">{errors.time}</span>}
                {!errors.time && formData.time && (
                  <span className="form-hint">
                    ⏰ Bookings must be at least 10 minutes ahead of current time
                  </span>
                )}
              </div>
            </div>

            {/* Location Details */}
            <div className="form-section">
              <label className="form-label">
                <span className="label-text">Where do you need help?</span>
                <span className="label-required">*</span>
              </label>
              <LocationSelector 
                onLocationSelect={handleLocationSelect}
                selectedLocation={formData.locationDetails}
                showAddNew={true}
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

        {/* Step 3: Payment */}
        {currentStep === 3 && savedBooking && (
          <PaymentPage
            booking={savedBooking}
            onPaymentComplete={handlePaymentComplete}
            onBack={handleBackToBooking}
          />
        )}

        {/* Step 4: Success & WhatsApp Handoff */}
        {currentStep === 4 && (
          <div className="form-step success-step">
            <div className="success-content">
              <div className="success-icon">✅</div>
              <h3 className="success-title">4. Your request is submitted!</h3>
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
                currentStep === 1 ? 'Next →' : 'Continue to Payment →'
              )}
            </button>
          </div>
        )}

        {/* Reset Button for Step 4 */}
        {currentStep === 4 && (
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

      {/* Sub-Service Modal */}
      <SubServiceModal
        isOpen={showSubServiceModal}
        onClose={() => setShowSubServiceModal(false)}
        onConfirm={handleSubServiceConfirm}
        serviceName={serviceCategories.find(cat => cat.value === formData.serviceCategory)?.label || 'Service'}
        subServices={subServiceConfig[formData.serviceCategory] || []}
      />
    </div>
  );
};

export default CompanionBookingForm;