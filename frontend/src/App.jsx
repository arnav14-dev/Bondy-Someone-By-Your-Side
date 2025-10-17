import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import Navbar from "./components/Navbar";
import AuthPage from './pages/AuthPage.jsx';
import LoginPage from './pages/loginPage.jsx';
import HomePage from './pages/homePage.jsx';
import BookingPage from './pages/bookingPage.jsx';
import BookingsPage from './pages/bookingsPage.jsx';
import ProfilePage from './pages/profilePage.jsx';
import AboutPage from './pages/aboutPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import './App.css'

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Load user from localStorage (like the real app)
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log('Loaded user from localStorage:', parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    setIsLoading(false);
  }, []);

  // Redirect logged-in users from base URL to /home
  useEffect(() => {
    const isLoggedIn = user && user._id;
    if (isLoggedIn && location.pathname === '/') {
      console.log('User is logged in, redirecting to /home');
      navigate('/home', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  const handleLogout = () => {
    console.log("User logged out");
    localStorage.removeItem('currentUser');
    setUser(null);
    navigate('/', { replace: true });
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Check if user is logged in
  const isLoggedIn = user && user._id;

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#F9FAFC'
      }}>
        <div style={{
          textAlign: 'center',
          fontFamily: 'Poppins, sans-serif'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #E5E7EB',
            borderTop: '4px solid #4E6EF2',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#6B7280', margin: 0 }}>Loading...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      {isLoggedIn && <Navbar user={user} onLogout={handleLogout} onNavigate={handleNavigation} />}
      <Routes>
        <Route path='/' element={<AuthPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/home' element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        <Route path='/booking' element={
          <ProtectedRoute>
            <BookingPage />
          </ProtectedRoute>
        } />
        <Route path='/bookings' element={
          <ProtectedRoute>
            <BookingsPage />
          </ProtectedRoute>
        } />
        <Route path='/profile' element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path='/services' element={
          <div style={{ marginTop: isLoggedIn ? "80px" : "0", padding: "2rem" }}>
            <h1>Services</h1>
            <p>Our services page is coming soon!</p>
          </div>
        } />
        <Route path='/about' element={<AboutPage />} />
        <Route path='/become' element={
          <div style={{ marginTop: isLoggedIn ? "80px" : "0", padding: "2rem" }}>
            <h1>Become a Bondy</h1>
            <p>Join our community as a companion!</p>
          </div>
        } />
        <Route path='/contact' element={
          <div style={{ marginTop: isLoggedIn ? "80px" : "0", padding: "2rem" }}>
            <h1>Contact Us</h1>
            <p>Get in touch with our team.</p>
          </div>
        } />
        {/* Fallback route */}
        <Route path='*' element={
          <div style={{ marginTop: isLoggedIn ? "80px" : "0", padding: "2rem" }}>
            <h1>Page Not Found</h1>
            <p>The page you're looking for doesn't exist.</p>
            <button onClick={() => navigate('/home')} style={{ 
              padding: '10px 20px', 
              backgroundColor: '#4e6ef2', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer'
            }}>
              Go to Homepage
            </button>
          </div>
        } />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
