import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Auth.module.css';

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    password: '', confirmPassword: '', terms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const validate = () => {
    const { firstName, lastName, email, phone, password, confirmPassword } = formData;
    if (!/^[A-Za-z\s-]{2,}$/.test(firstName)) return 'First name must be at least 2 letters.';
    if (!/^[A-Za-z\s-]{2,}$/.test(lastName)) return 'Last name must be at least 2 letters.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
    if (!/^[6-9]\d{9}$/.test(phone)) return 'Phone must start with 6-9 and be 10 digits.';
    if (!/^(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/.test(password))
      return 'Password must be 8+ characters with at least one special character.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.terms) { setMessage({ text: 'You must accept the Terms and Conditions.', type: 'error' }); return; }
    const err = validate();
    if (err) { setMessage({ text: err, type: 'error' }); return; }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch(`${API}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setMessage({ text: 'Account created! Redirecting...', type: 'success' });
        setTimeout(() => navigate('/dashboard'), 800);
      } else {
        setMessage({ text: data.message || 'Signup failed. Please try again.', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Server error. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ show }) => show ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

  return (
    <div className={styles.authPage}>
      <div className={`${styles.authCard} ${styles.authCardWide}`}>
        <div className={styles.authHeader}>
          <Link to="/home" className={styles.authLogo}>CIVITAS</Link>
          <h1 className={styles.authTitle}>Create your account</h1>
          <p className={styles.authSub}>Join thousands of citizens making a difference</p>
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
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>First Name</label>
              <input className={styles.input} type="text" name="firstName" placeholder="John" value={formData.firstName} onChange={handleChange} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Last Name</label>
              <input className={styles.input} type="text" name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} required />
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>Email address</label>
              <input className={styles.input} type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Phone Number</label>
              <input className={styles.input} type="tel" name="phone" placeholder="9876543210" value={formData.phone} onChange={handleChange} required />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <div className={styles.passwordWrapper}>
              <input className={`${styles.input} ${styles.inputPassword}`} type={showPassword ? 'text' : 'password'} name="password" placeholder="Min 8 chars, include special character" value={formData.password} onChange={handleChange} required />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password">
                <EyeIcon show={showPassword} />
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Confirm Password</label>
            <div className={styles.passwordWrapper}>
              <input className={`${styles.input} ${styles.inputPassword}`} type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Re-enter password" value={formData.confirmPassword} onChange={handleChange} required />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label="Toggle confirm password">
                <EyeIcon show={showConfirmPassword} />
              </button>
            </div>
          </div>

          <label className={styles.checkboxLabel}>
            <input type="checkbox" name="terms" checked={formData.terms} onChange={handleChange} className={styles.checkbox} />
            <span>I agree to the <Link to="/terms" className={styles.switchLink}>Terms and Conditions</Link></span>
          </label>

          {message.text && (
            <div className={`${styles.alert} ${styles[`alert${message.type.charAt(0).toUpperCase() + message.type.slice(1)}`]}`}>
              {message.text}
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.spinner}></span> : 'Create Account'}
          </button>
        </form>

        <p className={styles.switchAuth}>
          Already have an account?{' '}
          <Link to="/signin" className={styles.switchLink}>Sign in</Link>
        </p>

        <Link to="/home" className={styles.backHome}>← Back to Home</Link>
      </div>
    </div>
  );
}

export default Signup;