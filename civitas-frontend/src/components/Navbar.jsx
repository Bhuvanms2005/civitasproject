import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProfileDropdown from './ProfileDropdown';
import styles from './Navbar.module.css';

const Navbar = ({ user, toggleSidebar, onProfileUpdateSuccess, onNavigateToContent, onProfileDeleteResult }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/home');
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user?.firstName
    ? `${user.firstName.charAt(0)}${user.lastName ? user.lastName.charAt(0) : ''}`.toUpperCase()
    : 'U';

  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <button className={styles.hamburger} onClick={toggleSidebar} aria-label="Open menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <Link to="/dashboard" className={styles.logo}>CIVITAS</Link>
      </div>

      <div className={styles.right} ref={dropdownRef}>
        <button
          className={styles.avatarBtn}
          onClick={() => setDropdownOpen(!dropdownOpen)}
          aria-label="Profile menu"
        >
          <span className={styles.avatar}>{initials}</span>
          <span className={styles.userName}>{user?.firstName}</span>
          <svg
            width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5"
            className={`${styles.chevron} ${dropdownOpen ? styles.chevronUp : ''}`}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {dropdownOpen && (
          <ProfileDropdown
            user={user}
            onLogout={handleLogout}
            onClose={() => setDropdownOpen(false)}
            onProfileUpdateSuccess={onProfileUpdateSuccess}
            onNavigateToContent={onNavigateToContent}
            onProfileDeleteResult={onProfileDeleteResult}
          />
        )}
      </div>
    </nav>
  );
};

export default Navbar;
