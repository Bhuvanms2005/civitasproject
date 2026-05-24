import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';
import AdminHomeView from './AdminHomeView';
import ComplaintManagementView from './ComplaintManagementView';
import UserManagementView from './UserManagementView';
import NgoManagementView from './NgoManagementView';
import AnnouncementManagementView from './AnnouncementManagementView';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('home');
  const [toast, setToast] = useState(null);

  const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      const stored = localStorage.getItem('user');
      if (!token || !stored) { navigate('/signin'); return; }
      let parsed;
      try { parsed = JSON.parse(stored); } catch { navigate('/signin'); return; }
      if (parsed.role !== 'admin') { navigate('/dashboard'); return; }
      try {
        const res = await fetch(`${API}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            localStorage.clear(); navigate('/signin'); return;
          }
          throw new Error();
        }
        const data = await res.json();
        if (data.user.role !== 'admin') { localStorage.clear(); navigate('/signin'); return; }
        setUser(data.user);
      } catch {
        setError('Failed to load admin profile. Please sign in again.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate, API]);

  const handleNavigate = (view) => {
    setActiveView(view);
    setIsSidebarOpen(false);
  };

  if (loading) return (
    <div className={styles.fullscreen}>
      <div className={styles.spinner} />
      <p>Loading admin dashboard…</p>
    </div>
  );

  if (error) return (
    <div className={`${styles.fullscreen} ${styles.fullscreenError}`}>
      <p>{error}</p>
      <button onClick={() => navigate('/signin')} className={styles.errBtn}>Back to Sign In</button>
    </div>
  );

  if (!user) return null;

  return (
    <div className={styles.layout}>
      <AdminNavbar
        user={user}
        toggleSidebar={() => setIsSidebarOpen(v => !v)}
        onNavigate={handleNavigate}
      />
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onMenuItemClick={handleNavigate}
        activeItem={activeView}
      />

      {toast && (
        <div className={`${styles.toast} ${styles[`toast_${toast.type}`]}`}>
          {toast.type === 'success'
            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
          <span>{toast.msg}</span>
        </div>
      )}

      <main className={styles.main}>
        {activeView === 'home' && <AdminHomeView user={user} onNavigate={handleNavigate} showToast={showToast} />}
        {activeView === 'complaints' && <ComplaintManagementView user={user} showToast={showToast} />}
        {activeView === 'users' && <UserManagementView user={user} showToast={showToast} />}
        {activeView === 'ngos' && <NgoManagementView user={user} showToast={showToast} />}
        {activeView === 'announcements' && <AnnouncementManagementView user={user} showToast={showToast} />}
      </main>
    </div>
  );
};

export default AdminDashboard;
