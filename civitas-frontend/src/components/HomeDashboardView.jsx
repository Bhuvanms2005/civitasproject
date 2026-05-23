import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import L from 'leaflet';
import styles from './HomeDashboardView.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CATEGORY_COLORS = {
  'Sanitation & Waste': '#EF4444',
  'Drainage & Water': '#3B82F6',
  'Electrical & Lighting': '#F59E0B',
  'Road & Infrastructure': '#10B981',
  'Animal Safety / Nuisance': '#8B5CF6',
  'Public Safety': '#F97316',
};

const StatCard = ({ icon, label, value, color, subtitle }) => (
  <div className={styles.statCard} style={{ '--card-color': color }}>
    <div className={styles.statIcon}>{icon}</div>
    <div className={styles.statBody}>
      <p className={styles.statValue}>{value}</p>
      <p className={styles.statLabel}>{label}</p>
      {subtitle && <p className={styles.statSub}>{subtitle}</p>}
    </div>
  </div>
);

const SectionCard = ({ title, children, action }) => (
  <div className={styles.card}>
    <div className={styles.cardHeader}>
      <h2 className={styles.cardTitle}>{title}</h2>
      {action && <button className={styles.cardAction} onClick={action.onClick}>{action.label}</button>}
    </div>
    <div className={styles.cardBody}>{children}</div>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    'Pending': styles.badgePending,
    'Process Ongoing': styles.badgeOngoing,
    'Resolved': styles.badgeResolved,
    'Rejected': styles.badgeRejected,
  };
  return <span className={`${styles.badge} ${map[status] || styles.badgePending}`}>{status}</span>;
};

const Skeleton = ({ height = 20, width = '100%', radius = 6 }) => (
  <div className={styles.skeleton} style={{ height, width, borderRadius: radius }} />
);

const HomeDashboardView = ({ user, onNavigate }) => {
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [localComplaints, setLocalComplaints] = useState([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [cityData, setCityData] = useState(null);
  const [cityLoading, setCityLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [annLoading, setAnnLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [lbLoading, setLbLoading] = useState(true);
  const [zonesData, setZonesData] = useState(null);

  const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) { setLocationError('Geolocation not supported'); return; }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setLocation({ lat: coords.latitude, lon: coords.longitude }),
      () => setLocationError('Location access denied'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Local complaints
  useEffect(() => {
    if (!location) { if (locationError) setLocalLoading(false); return; }
    setLocalLoading(true);
    fetch(`${API}/complaints/local?lat=${location.lat}&lon=${location.lon}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setLocalComplaints(d.complaints || []))
      .catch(() => {}).finally(() => setLocalLoading(false));
  }, [location, locationError]);

  // City stats
  useEffect(() => {
    fetch(`${API}/complaints/city-stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setCityData(d.stats))
      .catch(() => {}).finally(() => setCityLoading(false));
  }, []);

  // Announcements
  useEffect(() => {
    const loc = user?.locality ? `&locality=${user.locality}` : '';
    fetch(`${API}/announcements?limit=4${loc}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setAnnouncements(d.announcements || []))
      .catch(() => {}).finally(() => setAnnLoading(false));
  }, []);

  // Leaderboard
  useEffect(() => {
    fetch(`${API}/users/leaderboard`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setLeaderboard((d.leaderboard || []).slice(0, 5)))
      .catch(() => {}).finally(() => setLbLoading(false));
  }, []);

  // Mock zones
  useEffect(() => {
    setZonesData({
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', properties: { name: 'Koramangala', zone: 'red', complaints: 45 }, geometry: { type: 'Polygon', coordinates: [[[77.618, 12.935], [77.62, 12.935], [77.62, 12.933], [77.618, 12.933], [77.618, 12.935]]] } },
        { type: 'Feature', properties: { name: 'Jayanagar', zone: 'orange', complaints: 20 }, geometry: { type: 'Polygon', coordinates: [[[77.585, 12.929], [77.587, 12.929], [77.587, 12.927], [77.585, 12.927], [77.585, 12.929]]] } },
        { type: 'Feature', properties: { name: 'Indiranagar', zone: 'green', complaints: 8 }, geometry: { type: 'Polygon', coordinates: [[[77.64, 12.974], [77.642, 12.974], [77.642, 12.972], [77.64, 12.972], [77.64, 12.974]]] } },
      ],
    });
  }, []);

  const getZoneStyle = (f) => {
    const map = { red: '#EF4444', orange: '#F97316', green: '#10B981' };
    const c = map[f.properties.zone] || '#6B7280';
    return { color: c, weight: 2, fillColor: c, fillOpacity: 0.4 };
  };

  const chartData = cityData ? {
    labels: cityData.labels,
    datasets: [{
      label: 'Complaints',
      data: cityData.data,
      backgroundColor: cityData.labels.map(l => CATEGORY_COLORS[l] || '#94A3B8'),
      borderRadius: 6,
      borderSkipped: false,
    }],
  } : null;

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#F1F5F9' }, ticks: { color: '#64748B', font: { size: 12 } } },
      x: { grid: { display: false }, ticks: { color: '#64748B', font: { size: 11 }, maxRotation: 30 } },
    },
  };

  const mapCenter = location ? [location.lat, location.lon] : [12.9716, 77.5946];

  return (
    <div className={styles.page}>
      {/* Hero greeting */}
      <div className={styles.hero}>
        <div>
          <h1 className={styles.heroTitle}>Good day, {user.firstName} 👋</h1>
          <p className={styles.heroSub}>
            {location
              ? `Showing civic data near your location`
              : locationError
              ? 'Enable location for local insights'
              : 'Detecting your location…'}
          </p>
        </div>
        <button
          className={styles.reportBtn}
          onClick={() => onNavigate && onNavigate({ type: 'reportComplaint', category: null, subType: null })}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Report an Issue
        </button>
      </div>

      {/* Quick stats */}
      <div className={styles.statsRow}>
        <StatCard icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>} label="Local Issues" value={localLoading ? '…' : localComplaints.length} color="#3B82F6" subtitle="Past 2 weeks" />
        <StatCard icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>} label="Resolved" value={localLoading ? '…' : localComplaints.filter(c => c.status === 'Resolved').length} color="#10B981" subtitle="In your area" />
        <StatCard icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} label="Pending" value={localLoading ? '…' : localComplaints.filter(c => c.status === 'Pending').length} color="#F59E0B" subtitle="Awaiting action" />
        <StatCard icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3z"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>} label="Announcements" value={annLoading ? '…' : announcements.length} color="#8B5CF6" subtitle="In your locality" />
      </div>

      {/* Main grid */}
      <div className={styles.grid}>
        {/* Local complaints list */}
        <SectionCard title="Nearby Complaints" action={onNavigate ? { label: 'View All', onClick: () => onNavigate('myComplaints') } : null}>
          {localLoading ? (
            <div className={styles.skeletonList}>{[1,2,3].map(i => <Skeleton key={i} height={68} radius={8} />)}</div>
          ) : localComplaints.length === 0 ? (
            <div className={styles.emptyState}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              <p>No complaints found nearby in the past 2 weeks</p>
            </div>
          ) : (
            <ul className={styles.complaintList}>
              {localComplaints.slice(0, 6).map(c => (
                <li key={c._id} className={styles.complaintItem}>
                  <div className={styles.complaintMeta}>
                    <span className={styles.complaintType}>{c.subType || c.category}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className={styles.complaintDesc}>{c.description}</p>
                  <p className={styles.complaintAddr}>{c.address}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        {/* Zone map */}
        <SectionCard title="Locality Condition Map">
          <div className={styles.mapWrap}>
            <MapContainer center={mapCenter} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
              {zonesData && <GeoJSON data={zonesData} style={getZoneStyle} onEachFeature={(f, l) => l.bindPopup(`<strong>${f.properties.name}</strong><br/>Zone: ${f.properties.zone.toUpperCase()}<br/>Complaints: ${f.properties.complaints}`)} />}
              {location && <Marker position={[location.lat, location.lon]}><Popup>Your Location</Popup></Marker>}
            </MapContainer>
          </div>
          <div className={styles.mapLegend}>
            {[['#EF4444','High Activity'],['#F97316','Moderate'],['#10B981','Low Activity']].map(([c,l]) => (
              <span key={l} className={styles.legendItem}><span className={styles.legendDot} style={{ background: c }} />{l}</span>
            ))}
          </div>
        </SectionCard>

        {/* City bar chart */}
        <SectionCard title="City-wide Complaint Breakdown">
          {cityLoading ? <Skeleton height={220} /> : !chartData || chartData.labels.length === 0 ? (
            <div className={styles.emptyState}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              <p>No city data available yet</p>
            </div>
          ) : (
            <div className={styles.chartWrap}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          )}
        </SectionCard>

        {/* Announcements */}
        <SectionCard title="Local Announcements" action={onNavigate ? { label: 'See All', onClick: () => onNavigate('announcements') } : null}>
          {annLoading ? (
            <div className={styles.skeletonList}>{[1,2,3].map(i => <Skeleton key={i} height={72} radius={8} />)}</div>
          ) : announcements.length === 0 ? (
            <div className={styles.emptyState}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3z"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <p>No announcements for your locality</p>
            </div>
          ) : (
            <ul className={styles.annList}>
              {announcements.map(a => (
                <li key={a._id} className={styles.annItem}>
                  <div className={styles.annTop}>
                    <span className={styles.annType}>{a.type}</span>
                    <span className={styles.annDate}>{new Date(a.publishedAt).toLocaleDateString()}</span>
                  </div>
                  <p className={styles.annTitle}>{a.title}</p>
                  <p className={styles.annContent}>{a.content}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        {/* Leaderboard */}
        <SectionCard title="Top Contributors" action={onNavigate ? { label: 'Full Board', onClick: () => onNavigate('leaderboard') } : null}>
          {lbLoading ? (
            <div className={styles.skeletonList}>{[1,2,3,4,5].map(i => <Skeleton key={i} height={48} radius={8} />)}</div>
          ) : leaderboard.length === 0 ? (
            <div className={styles.emptyState}><p>No leaderboard data yet</p></div>
          ) : (
            <ol className={styles.lbList}>
              {leaderboard.map((u, i) => (
                <li key={u._id || i} className={`${styles.lbItem} ${i === 0 ? styles.lbFirst : ''}`}>
                  <span className={styles.lbRank}>{i + 1}</span>
                  <div className={styles.lbAvatar}>{u.firstName?.charAt(0)}{u.lastName?.charAt(0)}</div>
                  <div className={styles.lbInfo}>
                    <p className={styles.lbName}>{u.firstName} {u.lastName}</p>
                    <p className={styles.lbSub}>{u.locality || 'Citizen'}</p>
                  </div>
                  <span className={styles.lbScore}>{u.complaintCount ?? u.score ?? 0} pts</span>
                </li>
              ))}
            </ol>
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default HomeDashboardView;