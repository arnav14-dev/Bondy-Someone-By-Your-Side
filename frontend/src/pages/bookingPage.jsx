import React, { useEffect } from 'react';
import '../styles/bookingPage.css';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import CompanionBookingForm from '../components/CompanionBookingForm.jsx';

const BookingPage = () => {
  // Get user data from localStorage
  const userData = localStorage.getItem('currentUser');
  const user = userData ? JSON.parse(userData) : null;

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/';
  };

  return (
    <div className="booking-page">
      <Navbar user={user} onLogout={handleLogout} />
      
      <main className="main-content">
        <div className="booking-page-container">
          <CompanionBookingForm user={user} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingPage;
