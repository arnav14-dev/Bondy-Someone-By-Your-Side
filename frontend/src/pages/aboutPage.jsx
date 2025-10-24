import React from 'react';
import '../styles/aboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-container">
          <div className="hero-content">
            <h1 className="hero-title">About Bondy</h1>
            <p className="hero-subtitle">
              Connecting people with trusted companions for care, support, and meaningful human connection.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="about-container">
          <div className="mission-content">
            <h2 className="section-title">Our Mission</h2>
            <p className="mission-text">
              At Bondy, we believe that everyone deserves access to reliable, compassionate care and companionship. 
              Our mission is to bridge the gap between those who need support and those who can provide it, 
              creating meaningful connections that enhance quality of life for all.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="about-container">
          <h2 className="section-title">Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              <h3 className="value-title">Trust & Safety</h3>
              <p className="value-description">
                Every companion is rigorously vetted, background-checked, and insured. 
                Your safety and peace of mind are our top priorities.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              <h3 className="value-title">Compassion</h3>
              <p className="value-description">
                We match you with companions who genuinely care about your well-being and 
                understand the importance of human connection.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
              </div>
              <h3 className="value-title">Reliability</h3>
              <p className="value-description">
                Count on us for consistent, dependable service. Our companions are committed 
                to showing up when you need them most.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                </svg>
              </div>
              <h3 className="value-title">Quality</h3>
              <p className="value-description">
                We maintain high standards through continuous training, feedback, and 
                improvement of our companion network.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="story-section">
        <div className="about-container">
          <div className="story-content">
            <h2 className="section-title">Our Story</h2>
            <div className="story-text">
              <p>
                Bondy was born from a simple observation: many people need help with daily tasks, 
                companionship, or care, but finding trustworthy, reliable assistance can be challenging. 
                Whether it's an elderly person needing help with errands, someone recovering from 
                surgery requiring assistance, or a family needing support during a busy time, 
                the need for dependable human connection is universal.
              </p>
              <p>
                We created Bondy to solve this problem by connecting people with verified, 
                compassionate companions who are not just service providers, but genuine human 
                connections. Our platform makes it easy to find the right person for your needs, 
                whether it's for a few hours, regular visits, or ongoing support.
              </p>
              <p>
                Today, Bondy has helped thousands of people find the companionship and support 
                they need, creating meaningful relationships that go beyond simple service delivery. 
                We're proud to be building a community where everyone can find someone by their side.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="services-overview">
        <div className="about-container">
          <h2 className="section-title">What We Offer</h2>
          <div className="services-grid">
            <div className="service-item">
              <div className="service-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  <path d="M6 21v-2a4 4 0 0 1 4-4h.5"/>
                </svg>
              </div>
              <h3>Elderly Companionship</h3>
              <p>Warm, non-medical care for social visits, reading, and quiet time at home.</p>
            </div>
            <div className="service-item">
              <div className="service-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </div>
              <h3>Errands & Groceries</h3>
              <p>Reliable assistance with grocery runs, prescription pickups, and household tasks.</p>
            </div>
            <div className="service-item">
              <div className="service-icon">
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
              <h3>Medical Support</h3>
              <p>Safe transportation and supportive presence for doctor visits, therapies, and night care.</p>
            </div>
            <div className="service-item">
              <div className="service-icon">
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
              </div>
              <h3>Kid's Escort & Care</h3>
              <p>Safe and reliable pick-up and drop-off services for children to school, activities, and appointments.</p>
            </div>
            <div className="service-item">
              <div className="service-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3>Household Assistant</h3>
              <p>Comprehensive home assistance including serving food, decoration, cleaning, and vessel maintenance.</p>
            </div>
          </div>
        </div>
      </section>


      {/* Team Section */}
      <section className="team-section">
        <div className="about-container">
          <h2 className="section-title">Our Commitment</h2>
          <div className="commitment-content">
            <div className="commitment-item">
              <h3>Verified Companions</h3>
              <p>Every companion undergoes thorough background checks, reference verification, and training.</p>
            </div>
            <div className="commitment-item">
              <h3>24/7 Support</h3>
              <p>Our support team is available around the clock to help with any questions or concerns.</p>
            </div>
            <div className="commitment-item">
              <h3>Insurance Coverage</h3>
              <p>All services are fully insured, giving you peace of mind and protection.</p>
            </div>
            <div className="commitment-item">
              <h3>Quality Assurance</h3>
              <p>We continuously monitor and improve our services based on feedback and best practices.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="about-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Find Your Companion?</h2>
            <p className="cta-subtitle">
              Join thousands of people who have found reliable, compassionate support through Bondy.
            </p>
            <div className="cta-buttons">
              <a href="/booking" className="cta-primary">Book a Companion</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
