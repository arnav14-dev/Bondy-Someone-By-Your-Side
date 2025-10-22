import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import '../styles/Layout.css';

const Layout = ({ children, user, onLogout, onNavigate, showFooter = true }) => {
  return (
    <div className="layout">
      {user && <Navbar user={user} onLogout={onLogout} onNavigate={onNavigate} />}
      <main className="main-content">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
