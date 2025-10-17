import React from 'react';
import '../styles/aboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
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
        <div className="container">
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
        <div className="container">
          <h2 className="section-title">Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h3 className="value-title">Trust & Safety</h3>
              <p className="value-description">
                Every companion is rigorously vetted, background-checked, and insured. 
                Your safety and peace of mind are our top priorities.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">❤️</div>
              <h3 className="value-title">Compassion</h3>
              <p className="value-description">
                We match you with companions who genuinely care about your well-being and 
                understand the importance of human connection.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">🔄</div>
              <h3 className="value-title">Reliability</h3>
              <p className="value-description">
                Count on us for consistent, dependable service. Our companions are committed 
                to showing up when you need them most.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">🌟</div>
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
        <div className="container">
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
        <div className="container">
          <h2 className="section-title">What We Offer</h2>
          <div className="services-grid">
            <div className="service-item">
              <div className="service-icon">👴</div>
              <h3>Elderly Companionship</h3>
              <p>Warm, non-medical care for social visits, reading, and quiet time at home.</p>
            </div>
            <div className="service-item">
              <div className="service-icon">🛒</div>
              <h3>Errands & Groceries</h3>
              <p>Reliable assistance with grocery runs, prescription pickups, and household tasks.</p>
            </div>
            <div className="service-item">
              <div className="service-icon">🏥</div>
              <h3>Medical Appointments</h3>
              <p>Safe transportation and supportive presence for doctor visits and therapies.</p>
            </div>
            <div className="service-item">
              <div className="service-icon">💻</div>
              <h3>Technology Help</h3>
              <p>Patient assistance with smartphones, computers, video calls, and new devices.</p>
            </div>
            <div className="service-item">
              <div className="service-icon">☕</div>
              <h3>Social Outings</h3>
              <p>A friendly partner for walks, museum visits, dining out, or local activities.</p>
            </div>
            <div className="service-item">
              <div className="service-icon">📋</div>
              <h3>Administrative Tasks</h3>
              <p>Help with paperwork, organizing mail, and scheduling reminders.</p>
            </div>
          </div>
        </div>
      </section>


      {/* Team Section */}
      <section className="team-section">
        <div className="container">
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
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Find Your Companion?</h2>
            <p className="cta-subtitle">
              Join thousands of people who have found reliable, compassionate support through Bondy.
            </p>
            <div className="cta-buttons">
              <a href="/booking" className="cta-primary">Book a Companion</a>
              <a href="/become" className="cta-secondary">Become a Companion</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
