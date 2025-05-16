import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="logo">
          <span role="img" aria-label="book">📚</span> Nearbook
        </div>
        {/* <ul className="nav-links">
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#faq">FAQ</a></li>
        </ul> */}
        <div className="nav-buttons">
          <button className="login-button" onClick={() => navigate('/login')}>Login</button>
          <button className="signup-button" onClick={() => navigate('/signup')}>Sign Up</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <h1>Discover Books with Nearbook</h1>
        <p>Connect with a community of book lovers to discover, share, and exchange your favorite reads.</p>
        <div className="hero-buttons">
          <button className="cta-button" onClick={() => navigate('/signup')}>Get Started</button>
          {/* <button className="demo-button">Learn More</button> */}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Why Choose Nearbook?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Exchange Easily</h3>
            <p>Trade books with others in just a few clicks. Find the titles you love and share your collection.</p>
          </div>
          <div className="feature-card">
            <h3>Community Driven</h3>
            <p>Join a passionate community of readers who share your love for books and stories.</p>
          </div>
          <div className="feature-card">
            <h3>Save & Sustain</h3>
            <p>Reduce waste by exchanging books instead of buying new ones. It’s eco-friendly and budget-friendly!</p>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="footer">
        <div className="trusted-partners">
          <span className="partner-logo">📖 BookHaven</span>
          <span className="partner-logo">📚 ReadCycle</span>
          <span className="partner-logo">🌟 StorySwap</span>
          <span className="partner-logo">📕 LitShare</span>
          <span className="partner-logo">📘 PageTurner</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;