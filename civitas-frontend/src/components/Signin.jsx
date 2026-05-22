import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Auth.module.css';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userJson = params.get('user');

    if (token && userJson) {
      try {
        const user = JSON.parse(decodeURIComponent(userJson));
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setMessage({ text: 'Signed in via Google. Redirecting...', type: 'success' });
        window.history.replaceState({}, '', window.location.pathname);
        setTimeout(() => navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard'), 600);
      } catch {
        setMessage({ text: 'Failed to process Google login data.', type: 'error' });
      }
    } else if (params.has('error')) {
      setMessage({ text: params.get('message') || 'Google sign-in failed.', type: 'error' });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setMessage({ text: 'Login successful! Redirecting...', type: 'success' });
        setTimeout(() => navigate(data.user.role === 'admin' ? '/admin/dashboard' : '/dashboard'), 700);
      } else {
        setMessage({ text: data.message || 'Login failed. Please check your credentials.', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Server error. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <Link to="/home" className={styles.authLogo}>CIVITAS</Link>
          <h1 className={styles.authTitle}>Welcome back</h1>
          <p className={styles.authSub}>Sign in to your account to continue</p>
        </div>

        <button
          type="button"
          className={styles.googleBtn}
          onClick={() => window.location.href = `${API}/auth/google`}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71C3.784 10.17 3.682 9.59 3.682 9s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className={styles.divider}><span>or</span></div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Email address</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <Link to="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
            </div>
            <div className={styles.passwordWrapper}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`${styles.input} ${styles.inputPassword}`}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {message.text && (
            <div className={`${styles.alert} ${styles[`alert${message.type.charAt(0).toUpperCase() + message.type.slice(1)}`]}`}>
              {message.text}
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.spinner}></span> : 'Sign In'}
          </button>
        </form>

        <p className={styles.switchAuth}>
          Don't have an account?{' '}
          <Link to="/signup" className={styles.switchLink}>Create one</Link>
        </p>

        <Link to="/home" className={styles.backHome}>← Back to Home</Link>
      </div>
    </div>
  );
};

export default SignIn;