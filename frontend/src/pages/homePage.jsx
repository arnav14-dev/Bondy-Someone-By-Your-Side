import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/homePage.css';
import { BASE_API_URL } from '../config/api.js';
import apiClient from '../utils/apiClient.js';
import { 
  isRequestInProgress, 
  markRequestInProgress, 
  markRequestComplete, 
  getCachedResponse, 
  setCachedResponse 
} from '../utils/requestTracker.js';
import '../utils/requestTracker.js';

const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoadingProfileImage, setIsLoadingProfileImage] = useState(false);
  const requestInProgress = useRef(false);
  const hasAttemptedFetch = useRef(false);


  useEffect(() => {
    // Get user data from localStorage (set during signup)
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Fetch profile image if user has one
      if (parsedUser.profilePicture && !isLoadingProfileImage) {
        fetchProfileImageWithUser(parsedUser, parsedUser.profilePicture);
      } else {
        setLoading(false);
      }
    } else {
      setError('No user data found. Please sign up first.');
      setLoading(false);
    }
  }, [isLoadingProfileImage]);

  const fetchProfileImageWithUser = async (userData, s3FileName) => {
    const userId = userData?._id || userData?.id;
    const globalKey = `profile-image-${userId}-${s3FileName}`;
    
    // AGGRESSIVE: If we've already attempted to fetch this image, don't try again
    if (hasAttemptedFetch.current) {
      setLoading(false);
      return;
    }

    // Check global tracker first - if request is already in progress, abort immediately
    if (isRequestInProgress(globalKey)) {
      setLoading(false);
      return;
    }

    // Check if we already have this image or request is in progress locally
    if (requestInProgress.current || profileImageUrl) {
      setLoading(false);
      return;
    }

    // Check cache first
    const cacheKey = `${userId}-${s3FileName}`;
    const cachedUrl = getCachedResponse(cacheKey);
    if (cachedUrl) {
      setProfileImageUrl(cachedUrl);
      setLoading(false);
      return;
    }

    // Mark as attempted and in progress globally and locally
    hasAttemptedFetch.current = true;
    markRequestInProgress(globalKey);
    requestInProgress.current = true;
    setIsLoadingProfileImage(true);
    
    try {
      const response = await fetch(`${BASE_API_URL}/api/s3/get-image-from-s3`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId || ''
        },
        body: JSON.stringify({ s3FileName }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data?.imageUrl) {
          // Cache the successful result
          setCachedResponse(cacheKey, data.data.imageUrl);
          setProfileImageUrl(data.data.imageUrl);
        }
      }
    } catch (err) {
      // Silently handle errors to prevent security breaches
      // No console logging of sensitive data
    } finally {
      markRequestComplete(globalKey);
      requestInProgress.current = false;
      setIsLoadingProfileImage(false);
      setLoading(false);
    }
  };

  const handleBookBondy = () => {
    navigate('/booking');
  };


  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Loading...</h1>
            <p className="auth-subtitle">Welcome to Bondy</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Error</h1>
            <p style={{ color: '#c33' }}>{error}</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="submit-button"
              style={{ marginTop: '20px' }}
            >
              Go to Signup
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage">
      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section" role="banner">
          <div className="hero-container">
            <motion.div 
              className="hero-content"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="hero-content-text">
              <motion.h1 
                className="hero-title"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              >
                Find someone by your side.
              </motion.h1>
              <motion.p 
                className="hero-subtitle"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              >
                Trusted, verified companions for care, errands, and meaningful connection—whenever you need a hand.
              </motion.p>
              </div>
              <motion.div 
                className="hero-ctas"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              >
                <button className="cta-primary" onClick={handleBookBondy}>
                  Book a Bondy
                </button>
              </motion.div>
              <motion.p 
                className="trust-builder"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
              >
                Every Bondy is background-checked and kindness-certified.
              </motion.p>
            </motion.div>
            <motion.div 
              className="hero-visual"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            >
              <img 
                src="/assets/homepageOldLady.png" 
                alt="Young person helping elderly person" 
                className="hero-image" 
              />
            </motion.div>
          </div>
        </section>

        {/* Bondy Promise Section */}
        <section className="bondy-promise">
          <div className="container">
            <h2 className="promise-title">
              Companionship Built on Kindness and Trust.
            </h2>
            <div className="promise-pillars">
              <div className="pillar">
                <div className="pillar-icon trust-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                </div>
                <h3 className="pillar-title">Verified for Peace of Mind</h3>
                <p className="pillar-description">
                  Every companion is rigorously vetted, insured, and background-checked so you can book with complete confidence.
                </p>
              </div>
              <div className="pillar">
                <div className="pillar-icon connection-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </div>
                <h3 className="pillar-title">Genuine Human Connection</h3>
                <p className="pillar-description">
                  We match you with companions who are naturally empathetic. It's more than assistance—it's about building a friendly, reliable relationship.
                </p>
              </div>
              <div className="pillar">
                <div className="pillar-icon booking-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <h3 className="pillar-title">Flexible & Simple Management</h3>
                <p className="pillar-description">
                  Manage all your appointments, track your companion's arrival status, and adjust schedules easily through our intuitive online portal.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Overview Section */}
        <section className="services-overview">
          <div className="container">
            <div className="services-header">
              <h2 className="services-title">A hand for every need.</h2>
              <p className="services-subtitle">
                Explore the ways our verified companions can help lighten your load and brighten your day.
              </p>
            </div>
            <div className="services-grid">
              <div className="service-card">
                <div className="service-icon elderly-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    <path d="M6 21v-2a4 4 0 0 1 4-4h.5"/>
                  </svg>
                </div>
                <h3 className="service-title">Elderly Companionship</h3>
                <p className="service-description">
                  Warm, non-medical care for social visits, reading, or quiet time at home.
                </p>
              </div>
              <div className="service-card">
                <div className="service-icon shopping-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                </div>
                <h3 className="service-title">Errands & Groceries</h3>
                <p className="service-description">
                  Reliable assistance with grocery runs, prescription pickups, and light household tasks.
                </p>
              </div>
              <div className="service-card">
                <div className="service-icon medical-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 21h18"/>
                    <path d="M5 21V7l8-4v18"/>
                    <path d="M19 21V11l-6-4"/>
                    <path d="M9 9v.01"/>
                    <path d="M9 12v.01"/>
                    <path d="M9 15v.01"/>
                    <path d="M9 18v.01"/>
                  </svg>
                </div>
                <h3 className="service-title">Medical Appointments</h3>
                <p className="service-description">
                  Safe transportation and a supportive presence for doctor visits and therapies.
                </p>
              </div>
              <div className="service-card">
                <div className="service-icon tech-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                </div>
                <h3 className="service-title">Technology Help</h3>
                <p className="service-description">
                  Patient assistance with smartphones, computers, video calls, and setting up new devices.
                </p>
              </div>
              <div className="service-card">
                <div className="service-icon social-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <h3 className="service-title">Social Outings</h3>
                <p className="service-description">
                  A friendly partner for walks, museum visits, dining out, or other local activities.
                </p>
              </div>
              <div className="service-card">
                <div className="service-icon admin-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                </div>
                <h3 className="service-title">Administrative Tasks</h3>
                <p className="service-description">
                  Help with simple paperwork, organizing mail, and scheduling reminders.
                </p>
              </div>
            </div>
            <div className="services-cta">
              <button className="cta-link" onClick={handleBookBondy}>Book a Bondy →</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
