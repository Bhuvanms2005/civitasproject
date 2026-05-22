import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Services.module.css';

const categories = [
  {
    emoji: '🗑️',
    title: 'Sanitation & Waste',
    subtitle: '2 complaint types',
    items: [
      { bold: 'Garbage Overflow', desc: 'Report unattended garbage piles for quick municipal cleanup.' },
      { bold: 'Missed Waste Pickup', desc: 'Notify if waste collection was skipped in your area.' },
    ],
  },
  {
    emoji: '🌊',
    title: 'Drainage & Water',
    subtitle: '2 complaint types',
    items: [
      { bold: 'Drainage Overflow', desc: 'Report overflowing or blocked drains to prevent health hazards.' },
      { bold: 'Waterlogging / Flooded Street', desc: 'Alert authorities about water accumulation or flooding.' },
    ],
  },
  {
    emoji: '🛣️',
    title: 'Road & Infrastructure',
    subtitle: '3 complaint types',
    items: [
      { bold: 'Pothole / Road Damage', desc: 'Flag dangerous potholes and cracked road surfaces for repair.' },
      { bold: 'Road Obstruction', desc: 'Report debris, fallen trees, or materials blocking the road.' },
      { bold: 'Footpath / Sidewalk Damage', desc: 'Report broken or unsafe pedestrian walkways.' },
    ],
  },
  {
    emoji: '💡',
    title: 'Street Lighting',
    subtitle: '2 complaint types',
    items: [
      { bold: 'Street Light Not Working', desc: 'Report non-functional lights that increase road risk.' },
      { bold: 'Damaged Light Pole', desc: 'Alert authorities about broken or hazardous light poles.' },
    ],
  },
  {
    emoji: '🐾',
    title: 'Animal & Public Safety',
    subtitle: '3 complaint types',
    items: [
      { bold: 'Stray Animal Menace', desc: 'Report aggressive or injured stray animals in your locality.' },
      { bold: 'Illegal Dumping', desc: 'Flag unauthorized dumping of waste in public spaces.' },
      { bold: 'Public Safety Hazard', desc: 'Report anything posing an immediate danger to residents.' },
    ],
  },
  {
    emoji: '🌳',
    title: 'Parks & Green Spaces',
    subtitle: '2 complaint types',
    items: [
      { bold: 'Fallen Tree / Branch', desc: 'Report dangerous fallen trees or branches blocking paths.' },
      { bold: 'Park Maintenance Issue', desc: 'Flag neglected parks, broken benches, or overgrown areas.' },
    ],
  },
];

function Services() {
  return (
    <div className={styles.servicesPage}>

      {/* ── HERO ──────────────────────────────── */}
      <section className={styles.hero}>
        <span className={styles.heroBadge}>What We Offer</span>
        <h1 className={styles.heroTitle}>
          Our <span className={styles.heroAccent}>Services</span> &amp;<br />
          Complaint Categories
        </h1>
        <p className={styles.heroSub}>
          From potholes to stray animals — Civitas covers every urban issue you face.
          Report, track, and see real change in your neighbourhood.
        </p>
      </section>

      {/* ── STATS BAR ─────────────────────────── */}
      <div className={styles.statsBar}>
        <div className={styles.statCell}>
          <span className={styles.statNum}>14+</span>
          <span className={styles.statDesc}>Issue Categories</span>
        </div>
        <div className={styles.statCell}>
          <span className={styles.statNum}>48h</span>
          <span className={styles.statDesc}>Avg Resolution</span>
        </div>
        <div className={styles.statCell}>
          <span className={styles.statNum}>100%</span>
          <span className={styles.statDesc}>Free to Use</span>
        </div>
        <div className={styles.statCell}>
          <span className={styles.statNum}>GPS</span>
          <span className={styles.statDesc}>Auto-Location</span>
        </div>
      </div>

      {/* ── BODY ──────────────────────────────── */}
      <main className={styles.body}>

        {/* Category Cards */}
        <div className={styles.categoryIntro}>
          <span className={styles.sectionTag}>Complaint Categories</span>
          <h2 className={styles.sectionTitle}>Every Issue Has a Category</h2>
          <p className={styles.sectionSub}>
            Choose from our structured categories to ensure your report reaches the right authority instantly.
          </p>
        </div>

        <div className={styles.categoriesGrid}>
          {categories.map((cat) => (
            <div key={cat.title} className={styles.categoryCard}>
              <div className={styles.categoryHeader}>
                <span className={styles.categoryEmoji}>{cat.emoji}</span>
                <div className={styles.categoryHeaderText}>
                  <h3>{cat.title}</h3>
                  <p>{cat.subtitle}</p>
                </div>
              </div>
              <div className={styles.categoryBody}>
                <ul className={styles.servicesList}>
                  {cat.items.map((item) => (
                    <li key={item.bold}>
                      <span><strong>{item.bold}</strong> – {item.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className={styles.howItWorks}>
          <span className={styles.sectionTag}>Process</span>
          <h2 className={styles.sectionTitle}>How to Raise a Complaint</h2>
          <p className={styles.sectionSub}>Four simple steps to get your issue resolved.</p>
          <div className={styles.stepsGrid}>
            {[
              { n: '01', title: 'Sign In', desc: 'Log in to your Civitas account or register in under a minute.' },
              { n: '02', title: 'Select Category', desc: 'Pick the type of issue from our organised category list.' },
              { n: '03', title: 'Add Details', desc: 'Upload a photo and confirm your location — GPS fills it automatically.' },
              { n: '04', title: 'Submit & Track', desc: 'Submit and monitor real-time status updates until resolved.' },
            ].map((s) => (
              <div key={s.n} className={styles.step}>
                <div className={styles.stepNumber}>{s.n}</div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Photo Guidelines */}
        <div className={styles.guidelines}>
          <h2>📸 Photo Upload Guidelines</h2>
          <p>Clear photos help us resolve your issue faster. Follow these tips:</p>
          <ul className={styles.guidelinesList}>
            {[
              'Ensure the image is clear and in focus.',
              'Take a wide shot to give context of the issue.',
              'Do not upload unrelated or blurry images.',
              'Limit image size to under 5MB for faster upload.',
              'Photograph in good lighting, especially for night issues.',
              'Include the immediate surroundings in the frame.',
            ].map((tip) => (
              <li key={tip}>
                <span className={styles.guideCheck}>✓</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className={styles.cta}>
          <h3>Every Complaint You Raise Builds a Better City</h3>
          <p>Join our community of active citizens and start making your neighbourhood safer today.</p>
          <Link to="/signup" className={styles.ctaBtn}>Start Reporting</Link>
          <Link to="/home" className={styles.ctaBtnOutline}>← Back to Home</Link>
        </div>

        <Link to="/home" className={styles.backLink}>← Return to Home</Link>
      </main>

      {/* ── FOOTER ──────────────────────────────── */}
      <footer className={styles.footer}>
        © {new Date().getFullYear()} Civitas · <Link to="/about">About</Link> · <Link to="/contact">Contact</Link>
      </footer>

    </div>
  );
}

export default Services;