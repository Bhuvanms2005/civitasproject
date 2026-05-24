import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import styles from './AdminHomeView.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const Skeleton = ({ h = 20, r = 8 }) => <div className={styles.skeleton} style={{ height: h, borderRadius: r }} />;

const KpiCard = ({ label, value, sub, icon, color }) => (
  <div className={styles.kpiCard}>
    <div className={styles.kpiIcon} style={{ background: color + '18', color }}>{icon}</div>
    <div className={styles.kpiBody}>
      <p className={styles.kpiValue}>{value}</p>
      <p className={styles.kpiLabel}>{label}</p>
      {sub && <p className={styles.kpiSub}>{sub}</p>}
    </div>
  </div>
);

const STATUS_COLORS = {
  'Pending': '#F59E0B', 'Process Ongoing': '#3B82F6',
  'Resolved': '#10B981', 'Rejected': '#EF4444',
};

const AdminHomeView = ({ user, onNavigate, showToast }) => {
  const [kpi, setKpi]             = useState(null);
  const [kpiLoading, setKpiLd]   = useState(true);
  const [zones, setZones]         = useState(null);
  const [zonesLoading, setZonesLd] = useState(true);
  const [activity, setActivity]   = useState([]);
  const [actLoading, setActLd]    = useState(true);

  const API   = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`${API}/admin/dashboard-stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (d.stats) setKpi(d.stats); })
      .catch(() => {}).finally(() => setKpiLd(false));
  }, []);

  useEffect(() => {
    fetch(`${API}/admin/zones/conditions`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (d.data) setZones(d.data); })
      .catch(() => {}).finally(() => setZonesLd(false));
  }, []);

  useEffect(() => {
    fetch(`${API}/admin/activity-feed`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setActivity(d.recentActivity || []))
      .catch(() => {}).finally(() => setActLd(false));
  }, []);

  const statusData = kpi?.complaintsByStatus
    ? {
        labels: Object.keys(kpi.complaintsByStatus),
        datasets: [{
          data: Object.values(kpi.complaintsByStatus),
          backgroundColor: Object.keys(kpi.complaintsByStatus).map(k => STATUS_COLORS[k] || '#94A3B8'),
          borderWidth: 2, borderColor: '#fff',
        }],
      }
    : null;

  const zoneStyle = (f) => {
    const m = { red: '#EF4444', orange: '#F97316', green: '#10B981' };
    const c = m[f.properties.zone] || '#94A3B8';
    return { color: c, weight: 2, fillColor: c, fillOpacity: 0.35 };
  };

  const timeAgo = (d) => {
    const m = Math.round((Date.now() - new Date(d).getTime()) / 60000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  })();

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{greeting}, {user.firstName}</h1>
          <p className={styles.pageSub}>Here's what's happening across Civitas today.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.headerBtn} onClick={() => onNavigate('complaints')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            View Complaints
          </button>
          <button className={`${styles.headerBtn} ${styles.headerBtnPrimary}`} onClick={() => onNavigate('announcements')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Announcement
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className={styles.kpiRow}>
        {kpiLoading ? [1,2,3,4].map(i => <Skeleton key={i} h={92} />) : <>
          <KpiCard label="Total Complaints" value={kpi?.totalComplaints ?? '—'} sub="All time" color="#3B82F6"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>} />
          <KpiCard label="New Today" value={kpi?.newToday ?? '—'} sub="Since midnight" color="#8B5CF6"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} />
          <KpiCard label="Resolved This Week" value={kpi?.resolvedThisWeek ?? '—'} sub="Last 7 days" color="#10B981"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>} />
          <KpiCard label="Avg. Resolution" value={kpi?.avgResolutionTime ?? '—'} sub="Per complaint" color="#F59E0B"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>} />
        </>}
      </div>

      {/* Status donut + map row */}
      <div className={styles.midRow}>
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Complaints by Status</span>
          </div>
          <div className={styles.cardBody}>
            {kpiLoading ? <Skeleton h={220} /> : !statusData ? (
              <div className={styles.empty}><p>No data yet</p></div>
            ) : (
              <div className={styles.donutWrap}>
                <Doughnut data={statusData} options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'right', labels: { font: { size: 12 }, padding: 16, color: '#64748B' } },
                  },
                  cutout: '65%',
                }} />
              </div>
            )}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Locality Condition Map</span>
          </div>
          <div className={styles.cardBody}>
            {zonesLoading ? <Skeleton h={240} /> : (
              <div className={styles.mapBox}>
                <MapContainer center={[12.9716, 77.5946]} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                  {zones && (
                    <GeoJSON data={zones} style={zoneStyle}
                      onEachFeature={(f, l) => l.bindPopup(
                        `<strong>${f.properties.name}</strong><br/>Zone: ${f.properties.zone?.toUpperCase()}<br/>Complaints: ${f.properties.complaints}`
                      )}
                    />
                  )}
                </MapContainer>
              </div>
            )}
            <div className={styles.mapLegend}>
              {[['#EF4444','High Activity'],['#F97316','Moderate'],['#10B981','Low']].map(([c,l]) => (
                <span key={l} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: c }} />{l}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity feed + Quick actions */}
      <div className={styles.bottomRow}>
        <div className={`${styles.card} ${styles.cardFlex2}`}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Recent Activity</span>
          </div>
          <div className={styles.cardBody}>
            {actLoading ? (
              <div className={styles.skelList}>{[1,2,3,4,5].map(i => <Skeleton key={i} h={48} />)}</div>
            ) : activity.length === 0 ? (
              <div className={styles.empty}><p>No recent activity</p></div>
            ) : (
              <ul className={styles.activityList}>
                {activity.map((a, i) => (
                  <li key={i} className={styles.activityItem}>
                    <div className={styles.activityDot} />
                    <div className={styles.activityContent}>
                      <p className={styles.activityDesc}>{a.description}</p>
                      <div className={styles.activityMeta}>
                        {a.by && <span>{a.by}</span>}
                        <span>{timeAgo(a.date)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Quick Actions</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.quickActions}>
              {[
                { label: 'Manage Complaints', sub: 'Review & assign issues', view: 'complaints', color: '#3B82F6',
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
                { label: 'Manage Users', sub: 'Edit roles & accounts', view: 'users', color: '#8B5CF6',
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
                { label: 'NGO Partners', sub: 'Review NGO accounts', view: 'ngos', color: '#10B981',
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> },
                { label: 'Announcements', sub: 'Post city-wide alerts', view: 'announcements', color: '#F59E0B',
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3z"/></svg> },
              ].map(a => (
                <button key={a.view} className={styles.quickAction} onClick={() => onNavigate(a.view)}>
                  <div className={styles.qaIcon} style={{ background: a.color + '15', color: a.color }}>{a.icon}</div>
                  <div className={styles.qaText}>
                    <p className={styles.qaLabel}>{a.label}</p>
                    <p className={styles.qaSub}>{a.sub}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.qaArrow}><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHomeView;