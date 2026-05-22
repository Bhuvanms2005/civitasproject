import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';

const NAV_LINKS = [
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Help', to: '/help' },
  { label: 'Contact', to: '/contact' },
];

const SLIDES = [
  { src: '/images/home-image3.jpg', alt: 'Community street cleaning' },
  { src: '/images/home-image2.jpeg', alt: 'Well-maintained road' },
  { src: '/images/home-image5.jpeg', alt: 'Drainage maintenance' },
  { src: '/images/home-image6.webp', alt: 'Smart city technology' },
];

const STATS = [
  { value: '12,000+', label: 'Issues Resolved' },
  { value: '45,000+', label: 'Active Citizens' },
  { value: '98%', label: 'Response Rate' },
  { value: '120+', label: 'Localities Covered' },
];

function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className={styles.page}>
      {/* Navbar */}
      <nav className={`${styles.navbar} ${scrolled ? styles.navScrolled : ''}`}>
        <Link to="/home" className={styles.logo}>CIVITAS</Link>

        <ul className={`${styles.navLinks} ${menuOpen ? styles.navOpen : ''}`}>
          {NAV_LINKS.map(l => (
            <li key={l.to}>
              <Link to={l.to} onClick={() => setMenuOpen(false)}>{l.label}</Link>
            </li>
          ))}
        </ul>

        <div className={styles.navActions}>
          <Link to="/signin" className={styles.btnOutline}>Sign In</Link>
          <Link to="/signup" className={styles.btnFilled}>Sign Up</Link>
        </div>

        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`${styles.bar} ${menuOpen ? styles.barOpen1 : ''}`}></span>
          <span className={`${styles.bar} ${menuOpen ? styles.barOpen2 : ''}`}></span>
          <span className={`${styles.bar} ${menuOpen ? styles.barOpen3 : ''}`}></span>
        </button>
      </nav>

      {menuOpen && <div className={styles.menuBackdrop} onClick={() => setMenuOpen(false)} />}

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroSlider}>
          {SLIDES.map((slide, i) => (
            <img
              key={i}
              src={slide.src}
              alt={slide.alt}
              className={`${styles.slide} ${i === currentSlide ? styles.slideActive : ''}`}
            />
          ))}
          <div className={styles.heroOverlay} />
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>Smart Civic Platform</div>
          <h1 className={styles.heroTitle}>
            Your City.<br />Your Voice.<br />
            <span className={styles.heroAccent}>Your Impact.</span>
          </h1>
          <p className={styles.heroDesc}>
            Report civic issues, track resolutions, and help build the city you deserve.
            Civitas connects citizens with local authorities for faster, transparent action.
          </p>
          <div className={styles.heroCta}>
            <Link to="/signup" className={styles.ctaPrimary}>Get Started Free</Link>
            <Link to="/about" className={styles.ctaSecondary}>Learn More</Link>
          </div>
        </div>

        <div className={styles.slideIndicators}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === currentSlide ? styles.dotActive : ''}`}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className={styles.stats}>
        {STATS.map(s => (
          <div key={s.label} className={styles.statItem}>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2>Why Choose Civitas?</h2>
          <p>A complete platform for transparent civic engagement</p>
        </div>
        <div className={styles.featuresGrid}>
          {[
            { icon: '📸', title: 'Photo Evidence', desc: 'Upload photos of civic issues to provide clear, verifiable evidence for faster resolution.' },
            { icon: '📍', title: 'Live Location', desc: 'Pin exact locations on an interactive map so authorities know exactly where to respond.' },
            { icon: '🔔', title: 'Real-time Tracking', desc: 'Track complaint status from submission to resolution with live status updates.' },
            { icon: '📊', title: 'City Analytics', desc: 'View city-wide complaint data and identify patterns in civic infrastructure issues.' },
            { icon: '🤝', title: 'Community Support', desc: "Upvote and support your neighbours' issues to boost their priority and visibility." },
            { icon: '🏆', title: 'Leaderboard', desc: 'Top civic contributors are recognized publicly, fostering an active citizen community.' },
          ].map(f => (
            <div key={f.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className={styles.ctaBanner}>
        <div className={styles.ctaBannerContent}>
          <h2>Ready to make a difference?</h2>
          <p>Join thousands of citizens already building better communities with Civitas.</p>
          <Link to="/signup" className={styles.ctaBannerBtn}>Create Free Account</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div>
            <div className={styles.footerLogo}>CIVITAS</div>
            <p className={styles.footerDesc}>Empowering citizens to build better, cleaner, smarter cities through transparent civic engagement.</p>
          </div>
          <div>
            <h4>Platform</h4>
            <ul>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/help">Help Center</Link></li>
            </ul>
          </div>
          <div>
            <h4>Account</h4>
            <ul>
              <li><Link to="/signin">Sign In</Link></li>
              <li><Link to="/signup">Sign Up</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li><Link to="/contact">Send a Message</Link></li>
              <li><a href="mailto:civitas935@gmail.com">civitas935@gmail.com</a></li>
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} Civitas. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;