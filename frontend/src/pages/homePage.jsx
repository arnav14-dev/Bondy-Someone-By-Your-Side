import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/authPage.css';
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
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

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
      const response = await fetch(`${BASE_API_URL}/s3/get-image-from-s3`, {
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

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/';
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
      <Navbar user={user} onLogout={handleLogout} />
      
      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-container">
            <div className="hero-content">
              <h1 className="hero-title">
                Find someone by your side.
              </h1>
              <p className="hero-subtitle">
                Trusted, verified companions for care, errands, and meaningful connection—whenever you need a hand.
              </p>
              <div className="hero-ctas">
                <button className="cta-primary" onClick={handleBookBondy}>
                  Book a Bondy
                </button>
              </div>
              <p className="trust-builder">
                Every Bondy is background-checked and kindness-certified.
              </p>
            </div>
            <div className="hero-visual">
              <img src="../assets/homepageOldLady.png" alt="Young person helping elderly person" className="hero-image" />
            </div>
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
                  🛡️
                </div>
                <h3 className="pillar-title">Verified for Peace of Mind</h3>
                <p className="pillar-description">
                  Every companion is rigorously vetted, insured, and background-checked so you can book with complete confidence.
                </p>
              </div>
              <div className="pillar">
                <div className="pillar-icon connection-icon">
                  💙
                </div>
                <h3 className="pillar-title">Genuine Human Connection</h3>
                <p className="pillar-description">
                  We match you with companions who are naturally empathetic. It's more than assistance—it's about building a friendly, reliable relationship.
                </p>
              </div>
              <div className="pillar">
                <div className="pillar-icon booking-icon">
                  📅
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
                  👴
                </div>
                <h3 className="service-title">Elderly Companionship</h3>
                <p className="service-description">
                  Warm, non-medical care for social visits, reading, or quiet time at home.
                </p>
              </div>
              <div className="service-card">
                <div className="service-icon shopping-icon">
                  🛒
                </div>
                <h3 className="service-title">Errands & Groceries</h3>
                <p className="service-description">
                  Reliable assistance with grocery runs, prescription pickups, and light household tasks.
                </p>
              </div>
              <div className="service-card">
                <div className="service-icon medical-icon">
                  🏥
                </div>
                <h3 className="service-title">Medical Appointments</h3>
                <p className="service-description">
                  Safe transportation and a supportive presence for doctor visits and therapies.
                </p>
              </div>
              <div className="service-card">
                <div className="service-icon tech-icon">
                  💻
                </div>
                <h3 className="service-title">Technology Help</h3>
                <p className="service-description">
                  Patient assistance with smartphones, computers, video calls, and setting up new devices.
                </p>
              </div>
              <div className="service-card">
                <div className="service-icon social-icon">
                  ☕
                </div>
                <h3 className="service-title">Social Outings</h3>
                <p className="service-description">
                  A friendly partner for walks, museum visits, dining out, or other local activities.
                </p>
              </div>
              <div className="service-card">
                <div className="service-icon admin-icon">
                  📋
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

      <Footer />
    </div>
  );
};

export default HomePage;
