import React from 'react';
import styles from './AdminSidebar.module.css';

const AdminSidebar = ({ isOpen, onClose, onMenuItemClick }) => {
  return (
    <>
      {/* FIX: Add overlay so sidebar can be closed on mobile */}
      {isOpen && <div className={styles.overlay} onClick={onClose}></div>}
      <div className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <button className={styles.closeButton} onClick={onClose}>&times;</button>
        <div className={styles.menuHeader}>
          <h3>Admin Tools</h3>
        </div>
        <ul className={styles.menuList}>
          <li onClick={() => onMenuItemClick('home')}>🏠 Dashboard Overview</li>
          <li onClick={() => onMenuItemClick('complaintManagement')}>📋 Complaint Management</li>
          <li onClick={() => onMenuItemClick('userManagement')}>👥 User Management</li>
          <li onClick={() => onMenuItemClick('ngoManagement')}>🏢 NGO Management</li>
          <li onClick={() => onMenuItemClick('announcementManagement')}>📢 Announcement Management</li>
        </ul>
      </div>
    </>
  );
};

export default AdminSidebar;