import React from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Shield,
  Award,
  Users
} from 'lucide-react';
import '../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', href: '/home' },
    { name: 'Bookings', href: '/bookings' },
    { name: 'Profile', href: '/profile' },
    { name: 'Services', href: '/services' },
  ];

  const services = [
    'Elderly Care',
    'Shopping Assistance',
    'Medical Appointments',
    'Social Companionship',
    'Transportation',
    'Household Tasks',
  ];

  const support = [
    'Help Center',
    'Safety Guidelines',
    'Terms of Service',
    'Privacy Policy',
    'Contact Support',
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-main">
          {/* Company Info */}
          <div className="footer-section">
            <div className="footer-brand">
              <img src="/assets/logo.png" alt="Bondy Logo" className="footer-logo" />
            </div>
            <p className="footer-description">
              Connecting hearts through trusted companionship. We provide reliable, 
              caring companions for all your daily needs and special moments.
            </p>
            <div className="footer-contact">
              <div className="contact-item">
                <Mail size={16} />
                <span>support@gen-link.com</span>
              </div>
              <div className="contact-item">
                <Phone size={16} />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="contact-item">
                <MapPin size={16} />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="footer-link">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="footer-section">
            <h3 className="footer-title">Our Services</h3>
            <ul className="footer-links">
              {services.map((service) => (
                <li key={service}>
                  <a href="#" className="footer-link">
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="footer-section">
            <h3 className="footer-title">Support</h3>
            <ul className="footer-links">
              {support.map((item) => (
                <li key={item}>
                  <a href="#" className="footer-link">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="footer-trust">
          <div className="trust-item">
            <Shield className="trust-icon" />
            <div className="trust-content">
              <h4>Verified & Safe</h4>
              <p>All companions are background checked</p>
            </div>
          </div>
          <div className="trust-item">
            <Award className="trust-icon" />
            <div className="trust-content">
              <h4>Quality Assured</h4>
              <p>5-star rated service guarantee</p>
            </div>
          </div>
          <div className="trust-item">
            <Users className="trust-icon" />
            <div className="trust-content">
              <h4>Community Driven</h4>
              <p>Built by and for our community</p>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © {currentYear} Bondy. All rights reserved.
            </p>
            <div className="footer-social">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="social-link"
                    aria-label={social.name}
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;