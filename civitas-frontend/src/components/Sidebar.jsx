import React from 'react';
import styles from './Sidebar.module.css';

const COMPLAINT_CATEGORIES = [
  {
    label: 'Sanitation & Waste',
    items: [
      { label: 'Garbage Overflow', subType: 'Garbage Overflow' },
      { label: 'Missed Waste Pickup', subType: 'Missed Waste Pickup' },
    ],
  },
  {
    label: 'Drainage & Water',
    items: [
      { label: 'Drainage Overflow', subType: 'Drainage Overflow' },
      { label: 'Waterlogging / Flooded Street', subType: 'Waterlogging / Flooded Street' },
    ],
  },
  {
    label: 'Electrical & Lighting',
    items: [
      { label: 'Streetlight Not Working', subType: 'Streetlight Not Working' },
      { label: 'Streetlight Always ON', subType: 'Streetlight Always ON' },
    ],
  },
  {
    label: 'Road & Infrastructure',
    items: [
      { label: 'Pothole / Damaged Road', subType: 'Pothole / Damaged Road' },
      { label: 'Tree Fallen / Road Obstruction', subType: 'Tree Fallen / Road Obstruction' },
    ],
  },
  {
    label: 'Animal Safety / Nuisance',
    items: [
      { label: 'Stray Dog Issue', subType: 'Stray Dog Issue' },
      { label: 'Cattle Blocking Road', subType: 'Cattle Blocking Road' },
    ],
  },
  {
    label: 'Public Safety',
    items: [
      { label: 'Noise Complaint', subType: 'Noise Complaint' },
      { label: 'Broken Footpath / Open Manhole', subType: 'Broken Footpath / Open Manhole' },
    ],
  },
];

const NavItem = ({ onClick, icon, label }) => (
  <li className={styles.navItem} onClick={onClick}>
    <span className={styles.navIcon}>{icon}</span>
    <span className={styles.navLabel}>{label}</span>
  </li>
);

const Sidebar = ({ isOpen, onClose, onMenuItemClick }) => {
  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} />}
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle}>Navigation</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className={styles.scrollArea}>
          {/* Main Navigation */}
          <div className={styles.section}>
            <p className={styles.sectionLabel}>Main</p>
            <ul className={styles.navList}>
              <NavItem
                onClick={() => onMenuItemClick('home')}
                label="Dashboard"
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                }
              />
              <NavItem
                onClick={() => onMenuItemClick('myComplaints')}
                label="My Complaints"
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                }
              />
            </ul>
          </div>

          <div className={styles.divider} />

          {/* Report Complaint */}
          <div className={styles.section}>
            <p className={styles.sectionLabel}>Report a Complaint</p>
            {COMPLAINT_CATEGORIES.map(cat => (
              <div key={cat.label} className={styles.category}>
                <p className={styles.categoryLabel}>{cat.label}</p>
                <ul className={styles.navList}>
                  {cat.items.map(item => (
                    <li
                      key={item.subType}
                      className={`${styles.navItem} ${styles.subItem}`}
                      onClick={() => onMenuItemClick({ type: 'reportComplaint', category: cat.label, subType: item.subType })}
                    >
                      <span className={styles.subDot} />
                      <span className={styles.navLabel}>{item.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
