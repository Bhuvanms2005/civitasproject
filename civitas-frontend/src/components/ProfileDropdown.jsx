import React from 'react';
import styles from './ProfileDropdown.module.css';

const ProfileDropdown = ({ user, onLogout, onClose, onNavigateToContent, onProfileDeleteResult }) => {
  const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  const handleDeleteProfile = async () => {
    if (!window.confirm('Are you sure you want to permanently delete your account? This cannot be undone.')) {
      onClose(); return;
    }
    onClose();
    const token = localStorage.getItem('token');
    if (!token) { onProfileDeleteResult('error', 'Not logged in.'); onLogout(); return; }
    try {
      const res = await fetch(`${API}/users/profile`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        onProfileDeleteResult('success', 'Account deleted successfully. Redirecting...');
        onLogout();
      } else {
        const data = await res.json();
        onProfileDeleteResult('error', data.message || 'Failed to delete account.');
      }
    } catch {
      onProfileDeleteResult('error', 'Network error during account deletion.');
    }
  };

  return (
    <div className={styles.dropdown}>
      <div className={styles.header}>
        <div className={styles.avatar}>
          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
        </div>
        <div className={styles.info}>
          <p className={styles.name}>{user.firstName} {user.lastName}</p>
          <p className={styles.email}>{user.email}</p>
          {user.phone && <p className={styles.phone}>{user.phone}</p>}
          <span className={styles.role}>{user.role}</span>
        </div>
      </div>

      <div className={styles.divider} />

      <button className={styles.item} onClick={() => { onNavigateToContent('editProfile'); onClose(); }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        Edit Profile
      </button>

      <button className={styles.item} onClick={onLogout}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Sign Out
      </button>

      <div className={styles.divider} />

      <button className={`${styles.item} ${styles.itemDanger}`} onClick={handleDeleteProfile}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        Delete Account
      </button>
    </div>
  );
};

export default ProfileDropdown;
