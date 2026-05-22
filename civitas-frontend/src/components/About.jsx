import React from 'react';
import { Link } from 'react-router-dom';
import styles from './About.module.css';

function About() {
  return (
    <div className={styles.aboutPage}>

      {/* ── HERO ───────────────────────────────── */}
      <section className={styles.aboutHero}>
        <span className={styles.heroBadge}>Our Story</span>
        <h1 className={styles.heroTitle}>
          Building <span className={styles.heroAccent}>Smarter</span> Cities,<br />
          Together
        </h1>
        <p className={styles.heroSub}>
          Civitas is a citizen-powered platform that bridges the gap between communities
          and civic authorities — turning everyday issues into resolved realities.
        </p>
      </section>

      {/* ── MISSION STRIP ──────────────────────── */}
      <div className={styles.missionStrip}>
        <div className={styles.missionItem}>
          <span className={styles.missionIcon}>🏙️</span>
          <span className={styles.missionLabel}>Smart Cities</span>
        </div>
        <div className={styles.missionItem}>
          <span className={styles.missionIcon}>🤝</span>
          <span className={styles.missionLabel}>Community First</span>
        </div>
        <div className={styles.missionItem}>
          <span className={styles.missionIcon}>⚡</span>
          <span className={styles.missionLabel}>Fast Resolution</span>
        </div>
      </div>

      {/* ── MAIN CONTENT ───────────────────────── */}
      <main className={styles.aboutBody}>

        <p className={styles.leadText}>
          Welcome to Civitas — a digital platform built with a vision to transform our cities
          into cleaner, smarter, and more livable spaces for everyone.
        </p>

        <div className={styles.storyGrid}>
          <div className={styles.storyCard}>
            <span className={styles.cardIcon}>🌱</span>
            <h3>Our Origin</h3>
            <p>
              Born from a desire to bridge the gap between citizens and local government,
              Civitas was built to give every resident a clear, direct voice in how their
              city is managed and maintained.
            </p>
          </div>
          <div className={styles.storyCard}>
            <span className={styles.cardIcon}>🎯</span>
            <h3>Our Mission</h3>
            <p>
              We harness technology to build a connected, aware, and responsive community —
              where every voice matters and every issue can be addressed in a timely,
              transparent manner.
            </p>
          </div>
          <div className={styles.storyCard}>
            <span className={styles.cardIcon}>📍</span>
            <h3>How It Works</h3>
            <p>
              Report any civic issue — garbage overflow, drainage blockage, road damage,
              or street light failures — by uploading a photo and your location. We route
              it to the right department instantly.
            </p>
          </div>
          <div className={styles.storyCard}>
            <span className={styles.cardIcon}>🔒</span>
            <h3>Your Privacy</h3>
            <p>
              Complaints are visible to the community for awareness, but your personal
              details remain private. Transparency without compromise.
            </p>
          </div>
        </div>

        {/* ── MISSION QUOTE BLOCK ──────────────── */}
        <div className={styles.missionBlock}>
          <p>
            This transparent and collaborative process is what drives our mission forward —
            building <strong>trust between citizens and local authorities</strong>. We are committed
            to making urban life better by using innovation, awareness, and cooperation as our
            core tools. Let's come together and use technology for good.{' '}
            <strong>Let's make our surroundings clean, functional, and safe</strong> — not just
            for ourselves but for future generations.
          </p>
        </div>

        {/* ── VALUES ──────────────────────────── */}
        <div className={styles.valuesSection}>
          <span className={styles.sectionLabel}>Our Core Values</span>
          <h2>What Drives Us Forward</h2>
          <div className={styles.valuesGrid}>
            <div className={styles.valueItem}>
              <span className={styles.valueEmoji}>🌍</span>
              <h4>Accountability</h4>
              <p>Every complaint is tracked and every resolution is documented. Nothing falls through the cracks.</p>
            </div>
            <div className={styles.valueItem}>
              <span className={styles.valueEmoji}>💬</span>
              <h4>Transparency</h4>
              <p>Open communication between citizens and authorities builds real, lasting trust in communities.</p>
            </div>
            <div className={styles.valueItem}>
              <span className={styles.valueEmoji}>🚀</span>
              <h4>Innovation</h4>
              <p>We continuously improve our platform to better serve the evolving needs of modern cities.</p>
            </div>
          </div>
        </div>

        {/* ── CTA ─────────────────────────────── */}
        <div className={styles.aboutCta}>
          <h3>Ready to Make a Difference?</h3>
          <p>Join thousands of citizens already shaping a better urban future with Civitas.</p>
          <Link to="/signup" className={styles.ctaBtn}>Get Started Free</Link>
          <Link to="/home" className={styles.ctaBtnOutline}>← Back to Home</Link>
        </div>

        <Link to="/home" className={styles.backLink}>
          ← Return to Home
        </Link>

      </main>

      {/* ── FOOTER ──────────────────────────────── */}
      <footer className={styles.aboutFooter}>
        © {new Date().getFullYear()} Civitas. Built for citizens, by citizens.{' '}
        <Link to="/home">Home</Link> · <Link to="/contact">Contact</Link>
      </footer>

    </div>
  );
}

export default About;