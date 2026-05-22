import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './ForgotPasswordPage.module.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!email) { setError('Please enter your email address.'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSent(true);
        setMessage(data.message || 'Reset link sent! Check your inbox.');
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Error requesting password reset:', err);
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>

        {/* ── LOGO ── */}
        <div className={styles.authHeader}>
          <Link to="/home" className={styles.authLogo}>CIVITAS</Link>

          {sent ? (
            <div className={styles.successState}>
              <span className={styles.successEmoji}>📬</span>
              <h3>Check your inbox</h3>
              <p>
                We've sent a password reset link to <strong>{email}</strong>.
                The link expires in 15 minutes. Check your spam folder if you don't see it.
              </p>
              <Link to="/signin" className={styles.switchLink}>← Back to Sign In</Link>
            </div>
          ) : (
            <>
              <div className={styles.iconWrap}>🔑</div>
              <h1 className={styles.authTitle}>Forgot Password?</h1>
              <p className={styles.authSub}>
                No worries — enter your email and we'll send you a secure reset link.
              </p>
            </>
          )}
        </div>

        {/* ── FORM (hidden after success) ── */}
        {!sent && (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label}>Email Address</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                autoFocus
              />
            </div>

            {message && <div className={styles.alert + ' ' + styles.alertSuccess}>{message}</div>}
            {error   && <div className={styles.alert + ' ' + styles.alertError}>{error}</div>}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <><span className={styles.spinner} /> Sending…</> : '📨 Send Reset Link'}
            </button>
          </form>
        )}

        {/* ── BOTTOM LINKS ── */}
        {!sent && (
          <>
            <p className={styles.switchAuth}>
              Remembered it?{' '}
              <Link to="/signin" className={styles.switchLink}>Sign In</Link>
            </p>
            <Link to="/home" className={styles.backHome}>← Back to Home</Link>
          </>
        )}

        {sent && (
          <Link to="/home" className={styles.backHome}>← Back to Home</Link>
        )}

      </div>
    </div>
  );
};

export default ForgotPasswordPage;