import React, { useEffect } from 'react';
import '../styles/bookingPage.css';
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

  return (
    <div className="booking-page">
      <div className="booking-page-container">
        <CompanionBookingForm user={user} />
      </div>
    </div>
  );
};

export default BookingPage;
