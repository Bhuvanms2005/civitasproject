import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './AdminNavbar.module.css';

const AdminNavbar = ({ user, toggleSidebar }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/signin'); };

  const initials = `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`.toUpperCase();

  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <button className={styles.hamburger} onClick={toggleSidebar} aria-label="Toggle menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <Link to="/admin/dashboard" className={styles.logo}>
          <span className={styles.logoText}>CIVITAS</span>
          <span className={styles.logoBadge}>Admin</span>
        </Link>
      </div>

      <div className={styles.right} ref={ref}>
        <button className={styles.avatarBtn} onClick={() => setOpen(!open)}>
          <span className={styles.avatar}>{initials}</span>
          <div className={styles.avatarInfo}>
            <p className={styles.avatarName}>{user?.firstName} {user?.lastName}</p>
            <p className={styles.avatarRole}>Administrator</p>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`${styles.chevron} ${open ? styles.chevronUp : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
        </button>

        {open && (
          <div className={styles.dropdown}>
            <div className={styles.dropdownHeader}>
              <p className={styles.dropdownName}>{user?.firstName} {user?.lastName}</p>
              <p className={styles.dropdownEmail}>{user?.email}</p>
            </div>
            <div className={styles.dropdownDivider} />
            <button className={`${styles.dropdownItem} ${styles.dropdownLogout}`} onClick={logout}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavbar;
