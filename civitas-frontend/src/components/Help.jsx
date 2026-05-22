import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Help.module.css';

function Help() {
  return (
    <div className={styles.helpPage}>

      {/* ── HERO ──────────────────────────────── */}
      <section className={styles.hero}>
        <span className={styles.heroBadge}>Help Centre</span>
        <h1 className={styles.heroTitle}>
          How Can We <span className={styles.heroAccent}>Help</span> You?
        </h1>
        <p className={styles.heroSub}>
          Everything you need to know about raising complaints, tracking issues,
          and getting the most out of Civitas.
        </p>
      </section>

      {/* ── SEARCH HINT ───────────────────────── */}
      <div className={styles.searchBar}>
        <div className={styles.searchInner}>
          <span className={styles.searchIcon}>🔍</span>
          <span>Browse topics below — How to raise a complaint, FAQs, photo tips…</span>
        </div>
      </div>

      {/* ── BODY ──────────────────────────────── */}
      <div className={styles.body}>

        {/* Sidebar TOC */}
        <nav className={styles.toc}>
          <p className={styles.tocTitle}>On this page</p>
          <ul className={styles.tocList}>
            <li><a href="#raise"><span className={styles.tocIcon}>📝</span>Raising a Complaint</a></li>
            <li><a href="#faq"><span className={styles.tocIcon}>❓</span>FAQs</a></li>
            <li><a href="#photos"><span className={styles.tocIcon}>📸</span>Photo Guidelines</a></li>
            <li><a href="#contact"><span className={styles.tocIcon}>💬</span>Still Need Help?</a></li>
          </ul>
        </nav>

        {/* Main Content */}
        <div className={styles.content}>

          {/* ── RAISE A COMPLAINT ─── */}
          <section id="raise" className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionEmoji}>📝</div>
              <h2>How to Raise a Complaint</h2>
            </div>
            <p>
              After signing in to your Civitas account, open the menu and select
              <strong> "Report Complaint"</strong>. Follow these steps:
            </p>
            <ol className={styles.stepList}>
              {[
                'Select the category of your issue — Garbage, Drainage, Road Damage, Street Light, Animal Safety, etc.',
                'Upload a clear photo of the problem so our team can assess it effectively.',
                'Enter the exact address or tap "Use Current Location" to auto-fill via GPS.',
                'Review your details and click Submit. You\'ll receive a confirmation instantly.',
                'Track your complaint\'s real-time status from your dashboard at any time.',
              ].map((step, i) => (
                <li key={i}>
                  <span className={styles.stepNum}>{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* ── FAQs ─── */}
          <section id="faq" className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionEmoji}>❓</div>
              <h2>Frequently Asked Questions</h2>
            </div>
            <ul className={styles.faqList}>
              {[
                {
                  q: 'What types of complaints can I report?',
                  a: 'You can report garbage overflow, drainage blockage, road damage, street light failures, stray animal menace, park maintenance issues, and more — 14+ categories in total.',
                },
                {
                  q: 'Can I track my complaint?',
                  a: 'Yes! You can track the real-time status of your complaint directly on your Civitas dashboard. If your complaint remains pending for more than 48 hours, you can re-raise it to alert authorities again.',
                },
                {
                  q: 'Will my complaint be public?',
                  a: 'Your complaint is visible to the community for awareness, helping others stay informed. However, your username and personal details are never disclosed, ensuring your privacy.',
                },
                {
                  q: 'What if I enter a wrong address?',
                  a: 'Please verify the address before submitting. Use the "Use Current Location" button to auto-fill accurately via GPS. You can edit a complaint before it is assigned.',
                },
                {
                  q: 'How long will it take to resolve?',
                  a: 'We aim to resolve issues within 48–72 hours depending on severity and locality. You\'ll receive status updates as your complaint progresses.',
                },
              ].map(({ q, a }) => (
                <li key={q} className={styles.faqItem}>
                  <div className={styles.faqQ}><strong>{q}</strong></div>
                  <div className={styles.faqA}>{a}</div>
                </li>
              ))}
            </ul>
          </section>

          {/* ── PHOTO GUIDELINES ─── */}
          <section id="photos" className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionEmoji}>📸</div>
              <h2>Photo Upload Guidelines</h2>
            </div>
            <p>
              Clear, well-framed photos help us resolve your issue faster and more accurately.
              Follow these guidelines when capturing the problem:
            </p>
            <ul className={styles.bulletList}>
              <li>Ensure the image is sharp and in focus.</li>
              <li>Take a wide shot if possible to give context of the surroundings.</li>
              <li>Do not upload unrelated, blurry, or dark images.</li>
              <li>Keep file size under 5MB for faster upload.</li>
              <li>Capture in good lighting — use flash or wait for daylight for night issues.</li>
              <li>Include the immediate surroundings so the location is clearly identifiable.</li>
            </ul>
          </section>

          {/* ── CONTACT CALLOUT ─── */}
          <section id="contact" className={styles.section}>
            <div className={styles.contactCallout}>
              <h3>Still Need Help?</h3>
              <p>Can't find what you're looking for? Our team is ready to assist you directly.</p>
              <Link to="/contact" className={styles.contactBtn}>Contact Us</Link>
              <Link to="/home" className={styles.contactBtnOutline}>← Back to Home</Link>
            </div>
          </section>

          <Link to="/home" className={styles.backLink}>← Return to Home</Link>
        </div>
      </div>

      {/* ── FOOTER ──────────────────────────────── */}
      <footer className={styles.footer}>
        © {new Date().getFullYear()} Civitas · <Link to="/about">About</Link> · <Link to="/contact">Contact</Link>
      </footer>

    </div>
  );
}

export default Help;