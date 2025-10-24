import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import Layout from "./components/Layout";
import AuthPage from './pages/authPage.jsx';
import LoginPage from './pages/loginPage.jsx';
import HomePage from './pages/homePage.jsx';
import BookingPage from './pages/bookingPage.jsx';
import BookingsPage from './pages/bookingsPage.jsx';
import ProfilePage from './pages/profilePage.jsx';
import AboutPage from './pages/aboutPage.jsx';
import LocationManagementPage from './pages/locationManagementPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminProtectedRoute from './components/AdminProtectedRoute.jsx';
import './App.css'
import ContactPage from "./pages/contactPage.jsx";
import AdminLoginPage from "./pages/adminLoginPage.jsx";
import AdminDashboard from "./pages/adminDashboard.jsx";
import AdminBookingsPage from "./pages/adminBookingsPage.jsx";
import AdminChatPage from "./pages/adminChatPage.jsx";
import AdminCompanionsPage from "./pages/adminCompanionsPage.jsx";

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Load user from localStorage (like the real app)
    const userData = localStorage.getItem('currentUser');
    const token = localStorage.getItem('token');
    
    console.log('App loading - userData:', !!userData, 'token:', !!token);
    console.log('App - localStorage contents:', {
      currentUser: localStorage.getItem('currentUser') ? 'present' : 'missing',
      token: localStorage.getItem('token') ? 'present' : 'missing',
      allKeys: Object.keys(localStorage)
    });
    
    if (userData && token) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('App setting user:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear invalid data
        console.log('App - clearing invalid data due to parse error');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
      }
    } else {
      console.log('App - no user data or token found, clearing partial data');
      // Clear any partial data
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
    }
    setIsLoading(false);
  }, []);

  // Redirect logged-in users from base URL to /home
  useEffect(() => {
    const isLoggedIn = user && user._id;
    if (isLoggedIn && location.pathname === '/') {
      navigate('/home', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  const handleLogout = () => {
    console.log('App - handleLogout called, clearing localStorage');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
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
      <Routes>
        <Route path='/' element={<AuthPage />} />
        <Route path='/login' element={<AuthPage />} />
        <Route path='/home' element={
          <ProtectedRoute>
            <Layout user={user} onLogout={handleLogout} onNavigate={handleNavigation}>
              <HomePage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path='/booking' element={
          <ProtectedRoute>
            <Layout user={user} onLogout={handleLogout} onNavigate={handleNavigation}>
              <BookingPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path='/bookings' element={
          <ProtectedRoute>
            <Layout user={user} onLogout={handleLogout} onNavigate={handleNavigation}>
              <BookingsPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path='/profile' element={
          <ProtectedRoute>
            <Layout user={user} onLogout={handleLogout} onNavigate={handleNavigation}>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path='/manage-locations' element={
          <ProtectedRoute>
            <Layout user={user} onLogout={handleLogout} onNavigate={handleNavigation}>
              <LocationManagementPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path='/about' element={
          <Layout user={user} onLogout={handleLogout} onNavigate={handleNavigation}>
            <AboutPage />
          </Layout>
        } />
        <Route path='/contact' element={
          <ProtectedRoute>
            <Layout user={user} onLogout={handleLogout} onNavigate={handleNavigation} showFooter={false}>
              <ContactPage user={user} />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path='/admin/login' element={<AdminLoginPage />} />
        <Route path='/admin/dashboard' element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        } />
        <Route path='/admin/bookings' element={
          <AdminProtectedRoute>
            <AdminBookingsPage />
          </AdminProtectedRoute>
        } />
        <Route path='/admin/companions' element={
          <AdminProtectedRoute>
            <AdminCompanionsPage />
          </AdminProtectedRoute>
        } />
        <Route path='/admin/chat' element={
          <AdminProtectedRoute>
            <AdminChatPage />
          </AdminProtectedRoute>
        } />
        
        {/* Fallback route */}
        <Route path='*' element={
          <div style={{ padding: "2rem" }}>
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
