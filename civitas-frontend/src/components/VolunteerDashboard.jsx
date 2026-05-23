import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import HomeDashboardView from './HomeDashboardView';
import MyComplaintsList from './MyComplaintsList';
import ComplaintForm from './ComplaintForm';
import ProfileEditForm from './ProfileEditForm';
import Leaderboard from './Leaderboard';
import LocalAnnouncements from './LocalAnnouncements';
import styles from './VolunteerDashboard.module.css';

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeContent, setActiveContent] = useState('home');
  const [toast, setToast] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/signin'); return; }
      try {
        const res = await fetch(`${API_BASE_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/signin');
            return;
          }
          throw new Error('Failed to fetch profile');
        }
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        setError('Failed to load your profile. Please sign in again.');
        setTimeout(() => navigate('/signin'), 2000);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [navigate, API_BASE_URL]);

  const handleProfileUpdateSuccess = (updatedUser) => {
    setUser(updatedUser);
    setActiveContent('home');
    showToast('Profile updated successfully!');
  };

  const handleProfileDeleteResult = (type, message) => {
    if (type === 'success') {
      showToast(message, 'success');
    } else {
      showToast(message, 'error');
    }
  };

  const handleSidebarClick = (contentKey) => {
    setActiveContent(contentKey);
    setIsSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className={styles.fullscreenState}>
        <div className={styles.spinner}></div>
        <p>Loading your dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.fullscreenState} ${styles.fullscreenError}`}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p>{error}</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className={styles.layout}>
      <Navbar
        user={user}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onProfileUpdateSuccess={handleProfileUpdateSuccess}
        onNavigateToContent={(key) => { setActiveContent(key); setIsSidebarOpen(false); }}
        onProfileDeleteResult={handleProfileDeleteResult}
      />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onMenuItemClick={handleSidebarClick} />

      {toast && (
        <div className={`${styles.toast} ${styles[`toast${toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}`]}`}>
          {toast.type === 'success' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          )}
          {toast.msg}
        </div>
      )}

      <main className={styles.main}>
        {activeContent === 'home' && <HomeDashboardView user={user} onNavigate={setActiveContent} />}
        {activeContent === 'myComplaints' && <MyComplaintsList user={user} />}
        {typeof activeContent === 'object' && activeContent?.type === 'reportComplaint' && (
          <ComplaintForm user={user} category={activeContent.category} subType={activeContent.subType} />
        )}
        {activeContent === 'editProfile' && (
          <ProfileEditForm user={user} onProfileUpdateSuccess={handleProfileUpdateSuccess} />
        )}
        {activeContent === 'leaderboard' && <Leaderboard user={user} />}
        {activeContent === 'announcements' && <LocalAnnouncements user={user} />}
      </main>
    </div>
  );
};

export default VolunteerDashboard;