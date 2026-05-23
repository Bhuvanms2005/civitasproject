import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Contact.module.css';

function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [statusMsg, setStatusMsg] = useState('');
  const [sending, setSending] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg('');
    setSending(true);
    try {
      const response = await fetch(`${API_BASE_URL}/contact/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        setStatusMsg('success');
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        setStatusMsg('error:' + (data.error || 'Failed to send message.'));
      }
    } catch (err) {
      setStatusMsg('error:Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.contactPage}>

      {/* ── HERO ──────────────────────────────── */}
      <section className={styles.hero}>
        <span className={styles.heroBadge}>Get In Touch</span>
        <h1 className={styles.heroTitle}>
          Contact <span className={styles.heroAccent}>Civitas</span>
        </h1>
        <p className={styles.heroSub}>
          Have a question, suggestion, or feedback? We'd love to hear from you.
          Our team typically responds within 24 hours.
        </p>
      </section>

      {/* ── INFO BAR ──────────────────────────── */}
      <div className={styles.infoBar}>
        <div className={styles.infoCell}>
          <span className={styles.infoIcon}>📞</span>
          <span className={styles.infoLabel}>Phone</span>
          <span className={styles.infoValue}>+91 98765 43210</span>
        </div>
        <div className={styles.infoCell}>
          <span className={styles.infoIcon}>✉️</span>
          <span className={styles.infoLabel}>Email</span>
          <span className={styles.infoValue}>
            <a href="mailto:civitas935@gmail.com">civitas935@gmail.com</a>
          </span>
        </div>
        <div className={styles.infoCell}>
          <span className={styles.infoIcon}>🕐</span>
          <span className={styles.infoLabel}>Response Time</span>
          <span className={styles.infoValue}>Within 24 hours</span>
        </div>
      </div>

      {/* ── BODY ──────────────────────────────── */}
      <div className={styles.body}>

        {/* ── FORM ────────────────────────────── */}
        <div className={styles.formSide}>
          <span className={styles.formSideTag}>Send a Message</span>
          <h2>We're Here to Listen</h2>
          <p>Fill in the form and we'll get back to you as soon as possible.</p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label}>Full Name</label>
              <input
                type="text"
                name="name"
                required
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Email Address</label>
              <input
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Phone Number <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
              <input
                type="tel"
                name="phone"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Your Message</label>
              <textarea
                name="message"
                required
                placeholder="Tell us how we can help…"
                value={formData.message}
                onChange={handleChange}
                className={styles.textarea}
              />
            </div>

            {statusMsg === 'success' && (
              <div className={styles.alertSuccess}>
                ✅ Message sent successfully! We'll reply within 24 hours.
              </div>
            )}
            {statusMsg.startsWith('error:') && (
              <div className={styles.alertError}>
                ❌ {statusMsg.replace('error:', '')}
              </div>
            )}

            <button type="submit" className={styles.submitBtn} disabled={sending}>
              {sending ? <><span className={styles.spinner} /> Sending…</> : '📨 Send Message'}
            </button>
          </form>

          <Link to="/home" className={styles.backLink}>← Back to Home</Link>
        </div>

        {/* ── INFO SIDE ───────────────────────── */}
        <div className={styles.infoSide}>

          <div className={styles.infoCard}>
            <h3>📬 Contact Information</h3>
            <div className={styles.infoRow}>
              <span className={styles.infoRowIcon}>📞</span>
              <span>+91 98765 43210</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoRowIcon}>✉️</span>
              <a href="mailto:civitas935@gmail.com">civitas935@gmail.com</a>
            </div>
          </div>

          <div className={styles.infoCard}>
            <h3>🌐 Follow Us</h3>
            <div className={styles.socialLinks}>
              <a
                href="https://www.facebook.com/profile.php?id=61578707147553"
                target="_blank" rel="noreferrer"
                className={styles.socialLink}
              >
                📘 Facebook
              </a>
              <a
                href="https://x.com/_CIVITAS__"
                target="_blank" rel="noreferrer"
                className={styles.socialLink}
              >
                🐦 Twitter/X
              </a>
              <a
                href="https://www.instagram.com/_civitas._/"
                target="_blank" rel="noreferrer"
                className={styles.socialLink}
              >
                📸 Instagram
              </a>
            </div>
          </div>

          <div className={styles.mapWrap}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.5632557750682!2d76.09234697484186!3d12.999762487318257!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba548177b7c2b31%3A0x3ed879cf0c80a1a0!2sX3XV%2BWX3%2C%20Ammeer%20Mohalla%2C%20Hassan%2C%20Karnataka%20573201!5e0!3m2!1sen!2sin!4v1754236592692!5m2!1sen!2sin"
              height="260"
              allowFullScreen=""
              loading="lazy"
              title="Civitas Location"
            />
          </div>

        </div>
      </div>

      {/* ── FOOTER ──────────────────────────────── */}
      <footer className={styles.footer}>
        © {new Date().getFullYear()} Civitas · <Link to="/about">About</Link> · <Link to="/help">Help</Link>
      </footer>

    </div>
  );
}

export default Contact;