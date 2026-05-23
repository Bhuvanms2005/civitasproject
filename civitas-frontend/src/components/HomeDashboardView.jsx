import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Tooltip, Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import L from 'leaflet';
import styles from './HomeDashboardView.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CAT_COLORS = {
  'Sanitation & Waste':       '#EF4444',
  'Drainage & Water':         '#3B82F6',
  'Electrical & Lighting':    '#F59E0B',
  'Road & Infrastructure':    '#10B981',
  'Animal Safety / Nuisance': '#8B5CF6',
  'Public Safety':            '#F97316',
};

/* ── tiny helpers ─────────────────────────────────────── */
const Skeleton = ({ h = 20, r = 8 }) => (
  <div className={styles.skeleton} style={{ height: h, borderRadius: r }} />
);

const StatusBadge = ({ status }) => {
  const cls = {
    'Pending':         styles.badgePending,
    'Process Ongoing': styles.badgeOngoing,
    'Resolved':        styles.badgeResolved,
    'Rejected':        styles.badgeRejected,
  };
  return (
    <span className={`${styles.badge} ${cls[status] || styles.badgePending}`}>
      {status}
    </span>
  );
};

const TypePill = ({ type }) => {
  const cls = {
    alert:   styles.pillAlert,
    news:    styles.pillNews,
    event:   styles.pillEvent,
    general: styles.pillGeneral,
  };
  return (
    <span className={`${styles.pill} ${cls[(type || '').toLowerCase()] || styles.pillGeneral}`}>
      {type || 'General'}
    </span>
  );
};

const timeAgo = (date) => {
  const h = Math.round((Date.now() - new Date(date).getTime()) / 3600000);
  if (h === 0) return 'Just now';
  if (h === 1) return '1h ago';
  return `${h}h ago`;
};

/* ── Quick-report category tiles ──────────────────────── */
const QUICK_CATS = [
  { label: 'Garbage',      cat: 'Sanitation & Waste',       sub: 'Garbage Overflow',           icon: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6' },
  { label: 'Drainage',     cat: 'Drainage & Water',         sub: 'Drainage Overflow',           icon: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 6v4l3 1.5' },
  { label: 'Pothole',      cat: 'Road & Infrastructure',    sub: 'Pothole / Damaged Road',      icon: 'M2 20h20M6 20V8l6-6 6 6v12' },
  { label: 'Street Light', cat: 'Electrical & Lighting',    sub: 'Streetlight Not Working',     icon: 'M9 18h6M10 22h4M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14' },
  { label: 'Stray Animal', cat: 'Animal Safety / Nuisance', sub: 'Stray Dog Issue',             icon: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-14v4m0 4h.01' },
  { label: 'Other Issue',  cat: null,                       sub: null,                          icon: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-6h.01M12 8v4' },
];

/* ════════════════════════════════════════════════════════
   ANNOUNCEMENTS PAGE  (replaces LocalAnnouncements.jsx)
   ════════════════════════════════════════════════════════ */
const AnnouncementsPage = ({ announcements, loading, onBack }) => {
  const now   = Date.now();
  const fresh = announcements.filter(
    a => (now - new Date(a.publishedAt).getTime()) <= 48 * 3600000
  );

  const borderClass = (type) => ({
    alert:   styles.acAlert,
    news:    styles.acNews,
    event:   styles.acEvent,
    general: styles.acGeneral,
  })[(type || '').toLowerCase()] || styles.acGeneral;

  return (
    <div className={styles.annPage}>
      {/* header */}
      <div className={styles.annPageHeader}>
        <button className={styles.backBtn} onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Dashboard
        </button>

        <div className={styles.annPageTitleRow}>
          <div>
            <h1 className={styles.annPageTitle}>Local Announcements</h1>
            <p className={styles.annPageSub}>
              Showing announcements from the last 48 hours · auto-expire after 48 h
            </p>
          </div>
          {!loading && fresh.length > 0 && (
            <span className={styles.annPageCount}>
              {fresh.length} active
            </span>
          )}
        </div>
      </div>

      {/* body */}
      {loading ? (
        <div className={styles.annPageGrid}>
          {[1,2,3,4].map(i => <Skeleton key={i} h={170} r={12} />)}
        </div>
      ) : fresh.length === 0 ? (
        <div className={styles.annPageEmpty}>
          <div className={styles.emptyIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3z"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <h3>No active announcements</h3>
          <p>Nothing posted for your locality in the last 48 hours. Check back later.</p>
        </div>
      ) : (
        <div className={styles.annPageGrid}>
          {fresh.map(a => (
            <div key={a._id} className={`${styles.annCard} ${borderClass(a.type)}`}>
              <div className={styles.annCardTop}>
                <TypePill type={a.type} />
                <span className={styles.annCardAge}>{timeAgo(a.publishedAt)}</span>
              </div>
              <h3 className={styles.annCardTitle}>{a.title}</h3>
              <p className={styles.annCardContent}>{a.content}</p>
              <div className={styles.annCardFooter}>
                <span className={styles.annCardLocality}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  {a.locality || 'City-wide'}
                </span>
                <span className={styles.annCardDate}>
                  {new Date(a.publishedAt).toLocaleString('en-IN', {
                    day: 'numeric', month: 'short',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════
   MAIN DASHBOARD
   ════════════════════════════════════════════════════════ */
const HomeDashboardView = ({ user, onNavigate }) => {
  const [view, setView]               = useState('home');   // 'home' | 'announcements'
  const [location, setLocation]       = useState(null);
  const [locationError, setLocErr]    = useState(null);
  const [localComplaints, setLocal]   = useState([]);
  const [localLoading, setLocalLd]    = useState(true);
  const [cityData, setCityData]       = useState(null);
  const [cityLoading, setCityLd]      = useState(true);
  const [announcements, setAnn]       = useState([]);
  const [annLoading, setAnnLd]        = useState(true);
  const [zonesData, setZones]         = useState(null);
  const [expandedId, setExpandedId]   = useState(null);

  const API   = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  /* geolocation */
  useEffect(() => {
    if (!navigator.geolocation) { setLocErr('Geolocation not supported'); return; }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setLocation({ lat: coords.latitude, lon: coords.longitude }),
      ()           => setLocErr('Location access denied — enable for local insights'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  /* local complaints */
  useEffect(() => {
    if (!location) { if (locationError) setLocalLd(false); return; }
    fetch(`${API}/complaints/local?lat=${location.lat}&lon=${location.lon}`,
      { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setLocal(d.complaints || []))
      .catch(() => {}).finally(() => setLocalLd(false));
  }, [location, locationError]);

  /* city stats */
  useEffect(() => {
    fetch(`${API}/complaints/city-stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setCityData(d.stats))
      .catch(() => {}).finally(() => setCityLd(false));
  }, []);

  /* announcements — last 48 h only */
  useEffect(() => {
    const loc = user?.locality ? `&locality=${user.locality}` : '';
    fetch(`${API}/announcements?limit=20${loc}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        const now   = Date.now();
        const fresh = (d.announcements || []).filter(
          a => (now - new Date(a.publishedAt).getTime()) <= 48 * 3600000
        );
        setAnn(fresh);
      })
      .catch(() => {}).finally(() => setAnnLd(false));
  }, []);

  /* mock zone data */
  useEffect(() => {
    setZones({
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', properties: { name: 'Koramangala', zone: 'red',    complaints: 45 },
          geometry: { type: 'Polygon', coordinates: [[[77.618,12.935],[77.62,12.935],[77.62,12.933],[77.618,12.933],[77.618,12.935]]] } },
        { type: 'Feature', properties: { name: 'Jayanagar',   zone: 'orange', complaints: 20 },
          geometry: { type: 'Polygon', coordinates: [[[77.585,12.929],[77.587,12.929],[77.587,12.927],[77.585,12.927],[77.585,12.929]]] } },
        { type: 'Feature', properties: { name: 'Indiranagar', zone: 'green',  complaints: 8  },
          geometry: { type: 'Polygon', coordinates: [[[77.64,12.974],[77.642,12.974],[77.642,12.972],[77.64,12.972],[77.64,12.974]]] } },
      ],
    });
  }, []);

  const getZoneStyle = (f) => {
    const m = { red: '#EF4444', orange: '#F97316', green: '#10B981' };
    const c = m[f.properties.zone] || '#6B7280';
    return { color: c, weight: 2, fillColor: c, fillOpacity: 0.3 };
  };

  const chartData = cityData ? {
    labels: cityData.labels,
    datasets: [{
      label: 'Complaints',
      data:  cityData.data,
      backgroundColor: cityData.labels.map(l => CAT_COLORS[l] || '#94A3B8'),
      borderRadius: 5,
      borderSkipped: false,
    }],
  } : null;

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#F1F5F9' }, ticks: { color: '#94A3B8', font: { size: 11 } } },
      x: { grid: { display: false }, ticks: { color: '#94A3B8', font: { size: 10 }, maxRotation: 30 } },
    },
  };

  const mapCenter  = location ? [location.lat, location.lon] : [12.9716, 77.5946];
  const resolved   = localComplaints.filter(c => c.status === 'Resolved').length;
  const pending    = localComplaints.filter(c => c.status === 'Pending').length;

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  })();

  /* ── announcements full view ── */
  if (view === 'announcements') {
    return (
      <AnnouncementsPage
        announcements={announcements}
        loading={annLoading}
        onBack={() => setView('home')}
      />
    );
  }

  /* ── home view ── */
  return (
    <div className={styles.page}>

      {/* ── GREETING ── */}
      <div className={styles.greeting}>
        <div>
          <h1 className={styles.greetTitle}>
            {greeting}, <span className={styles.greetName}>{user.firstName}</span>
          </h1>
          <p className={styles.greetSub}>
            {locationError
              ? locationError
              : location
              ? 'Showing civic data near your location'
              : 'Detecting your location…'}
          </p>
        </div>

        {/* Single bell — one click, zero confusion */}
        <button
          className={styles.bellBtn}
          onClick={() => setView('announcements')}
          aria-label="View announcements"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3z"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {!annLoading && announcements.length > 0 && (
            <span className={styles.bellBadge}>{announcements.length}</span>
          )}
        </button>
      </div>

      {/* ── STATS — 3 cards only, no duplicate nav ── */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#EFF6FF' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#3B82F6" strokeWidth="2" strokeLinecap="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div>
            <p className={styles.statNum}>{localLoading ? '—' : localComplaints.length}</p>
            <p className={styles.statLbl}>Local Issues</p>
            <p className={styles.statSub}>Past 2 weeks</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#F0FDF4' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#10B981" strokeWidth="2.2" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div>
            <p className={styles.statNum}>{localLoading ? '—' : resolved}</p>
            <p className={styles.statLbl}>Resolved</p>
            <p className={styles.statSub}>In your area</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#FFFBEB' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#F59E0B" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div>
            <p className={styles.statNum}>{localLoading ? '—' : pending}</p>
            <p className={styles.statLbl}>Pending</p>
            <p className={styles.statSub}>Awaiting action</p>
          </div>
        </div>
      </div>

      {/* ── QUICK REPORT STRIP ── */}
      <div className={styles.quickStrip}>
        <p className={styles.quickLabel}>Report an issue quickly</p>
        <div className={styles.quickGrid}>
          {QUICK_CATS.map(({ label, cat, sub, icon }) => (
            <button
              key={label}
              className={styles.quickBtn}
              onClick={() => onNavigate && onNavigate({ type: 'reportComplaint', category: cat, subType: sub })}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d={icon}/>
              </svg>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN 2-COLUMN GRID ── */}
      <div className={styles.grid}>

        {/* Nearby complaints */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Nearby Complaints</span>
            <button
              className={styles.cardLink}
              onClick={() => onNavigate && onNavigate('myComplaints')}
            >
              View all →
            </button>
          </div>
          <div className={styles.cardBody}>
            {localLoading ? (
              <div className={styles.skelList}>{[1,2,3].map(i => <Skeleton key={i} h={52} />)}</div>
            ) : localComplaints.length === 0 ? (
              <Empty msg="No complaints found nearby in the past 2 weeks" />
            ) : (
              <ul className={styles.cList}>
                {localComplaints.slice(0, 6).map(c => (
                  <li
                    key={c._id}
                    className={`${styles.cItem} ${expandedId === c._id ? styles.cOpen : ''}`}
                    onClick={() => setExpandedId(expandedId === c._id ? null : c._id)}
                  >
                    <div className={styles.cRow}>
                      <div className={styles.cLeft}>
                        <span className={styles.cType}>{c.subType || c.category}</span>
                        <StatusBadge status={c.status} />
                      </div>
                      <svg
                        className={`${styles.cChev} ${expandedId === c._id ? styles.cChevOpen : ''}`}
                        width="12" height="12" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5">
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </div>
                    {expandedId === c._id && (
                      <div className={styles.cExpanded}>
                        <p className={styles.cDesc}>{c.description}</p>
                        {c.address && (
                          <p className={styles.cAddr}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            </svg>
                            {c.address}
                          </p>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Zone map */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Locality Condition Map</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.mapBox}>
              <MapContainer center={mapCenter} zoom={12} scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                {zonesData && (
                  <GeoJSON data={zonesData} style={getZoneStyle}
                    onEachFeature={(f, l) =>
                      l.bindPopup(
                        `<strong>${f.properties.name}</strong><br/>` +
                        `Zone: ${f.properties.zone.toUpperCase()}<br/>` +
                        `Complaints: ${f.properties.complaints}`
                      )
                    }
                  />
                )}
                {location && (
                  <Marker position={[location.lat, location.lon]}>
                    <Popup>Your Location</Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
            <div className={styles.mapLegend}>
              {[['#EF4444','High'],['#F97316','Moderate'],['#10B981','Low']].map(([c, l]) => (
                <span key={l} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: c }}/>
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* City chart */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>City-wide Breakdown</span>
            <span className={styles.cardMeta}>Past 2 weeks</span>
          </div>
          <div className={styles.cardBody}>
            {cityLoading ? (
              <Skeleton h={220} />
            ) : !chartData || chartData.labels.length === 0 ? (
              <Empty msg="No city data available yet" />
            ) : (
              <div className={styles.chartBox}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            )}
          </div>
        </div>

        {/* Announcements preview — single click goes to full page */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>
              Announcements
              {!annLoading && announcements.length > 0 && (
                <span className={styles.annCount}>{announcements.length}</span>
              )}
            </span>
            <button className={styles.cardLink} onClick={() => setView('announcements')}>
              See all →
            </button>
          </div>
          <div className={styles.cardBody}>
            {annLoading ? (
              <div className={styles.skelList}>{[1,2].map(i => <Skeleton key={i} h={72} />)}</div>
            ) : announcements.length === 0 ? (
              <Empty msg="No announcements in the last 48 hours" />
            ) : (
              <ul className={styles.annPreviewList}>
                {announcements.slice(0, 3).map(a => (
                  <li key={a._id} className={styles.annPreviewItem}>
                    <div className={styles.annPreviewTop}>
                      <TypePill type={a.type} />
                      <span className={styles.annPreviewAge}>{timeAgo(a.publishedAt)}</span>
                    </div>
                    <p className={styles.annPreviewTitle}>{a.title}</p>
                    <p className={styles.annPreviewBody}>{a.content}</p>
                  </li>
                ))}
                {announcements.length > 3 && (
                  <li>
                    <button className={styles.annMore} onClick={() => setView('announcements')}>
                      +{announcements.length - 3} more announcement{announcements.length - 3 !== 1 ? 's' : ''}
                    </button>
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

/* tiny empty-state helper */
const Empty = ({ msg }) => (
  <div className={styles.empty}>
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
    <p>{msg}</p>
  </div>
);

export default HomeDashboardView;