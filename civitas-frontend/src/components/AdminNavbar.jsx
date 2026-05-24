import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminNavbar.module.css';

const AdminNavbar = ({ user, toggleSidebar, onNavigate }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/signin');
  };

  const initials = `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`.toUpperCase();

  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <button className={styles.hamburger} onClick={toggleSidebar} aria-label="Toggle sidebar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div className={styles.brand}>
          <span className={styles.brandName}>CIVITAS</span>
          <span className={styles.brandBadge}>Admin</span>
        </div>
      </div>

      <div className={styles.right} ref={ref}>
        <button className={styles.profileBtn} onClick={() => setOpen(v => !v)}>
          <span className={styles.avatar}>{initials}</span>
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>{user?.firstName} {user?.lastName}</span>
            <span className={styles.profileRole}>Administrator</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            className={`${styles.chevron} ${open ? styles.chevronUp : ''}`}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {open && (
          <div className={styles.dropdown}>
            <div className={styles.dropdownUser}>
              <span className={styles.dropdownAvatar}>{initials}</span>
              <div>
                <p className={styles.dropdownName}>{user?.firstName} {user?.lastName}</p>
                <p className={styles.dropdownEmail}>{user?.email}</p>
              </div>
            </div>
            <div className={styles.dropdownDivider} />
            <button className={`${styles.dropdownItem} ${styles.dropdownDanger}`} onClick={logout}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavbar;
