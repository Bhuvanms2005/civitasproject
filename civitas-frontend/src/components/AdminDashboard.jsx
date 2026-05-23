import React, { useState, useEffect } from 'react';
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
  const [activeContent, setActiveContent] = useState('home');

  const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      const stored = localStorage.getItem('user');
      if (!token || !stored) { navigate('/signin'); return; }

      let parsed;
      try { parsed = JSON.parse(stored); } catch { navigate('/signin'); return; }
      if (parsed.role !== 'admin') { navigate('/dashboard'); return; }

      try {
        const res = await fetch(`${API}/users/profile`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) { localStorage.clear(); navigate('/signin'); return; }
          throw new Error();
        }
        const data = await res.json();
        if (data.user.role !== 'admin') { localStorage.clear(); navigate('/signin'); return; }
        setUser(data.user);
      } catch { setError('Failed to load admin profile.'); }
      finally { setLoading(false); }
    };
    init();
  }, [navigate, API]);

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
      <AdminNavbar user={user} toggleSidebar={() => setIsSidebarOpen(v => !v)} />
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onMenuItemClick={(k) => { setActiveContent(k); setIsSidebarOpen(false); }} activeItem={activeContent} />
      <main className={styles.main}>
        {activeContent === 'home' && <AdminHomeView user={user} />}
        {activeContent === 'complaintManagement' && <ComplaintManagementView user={user} />}
        {activeContent === 'userManagement' && <UserManagementView user={user} />}
        {activeContent === 'ngoManagement' && <NgoManagementView user={user} />}
        {activeContent === 'announcementManagement' && <AnnouncementManagementView user={user} />}
      </main>
    </div>
  );
};

export default AdminDashboard;
