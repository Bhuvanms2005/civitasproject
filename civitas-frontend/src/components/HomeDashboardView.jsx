import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import L from 'leaflet';
import styles from './HomeDashboardView.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

/* ── helpers ── */
const Skeleton = ({ h = 20, r = 6 }) => (
  <div className={styles.skeleton} style={{ height: h, borderRadius: r }} />
);

const StatusBadge = ({ status }) => {
  const cls = {
    'Pending':         styles.badgePending,
    'Process Ongoing': styles.badgeOngoing,
    'Resolved':        styles.badgeResolved,
    'Rejected':        styles.badgeRejected,
  };
  return <span className={`${styles.badge} ${cls[status] || styles.badgePending}`}>{status}</span>;
};

const AnnTypePill = ({ type }) => {
  const cls = {
    alert:   styles.annTypePillAlert,
    news:    styles.annTypePillNews,
    event:   styles.annTypePillEvent,
    general: styles.annTypePillGeneral,
  };
  return (
    <span className={`${styles.annTypePill} ${cls[type] || styles.annTypePillGeneral}`}>
      {type}
    </span>
  );
};

const hoursAgoLabel = (date) => {
  const h = Math.round((Date.now() - new Date(date).getTime()) / 3600000);
  if (h === 0) return 'Just now';
  if (h === 1) return '1h ago';
  return `${h}h ago`;
};

/* ═══ ANNOUNCEMENTS PAGE ═══════════════════════════════ */
const AnnouncementsPage = ({ announcements, loading, onBack }) => {
  const now = Date.now();
  const fresh = announcements.filter(a => {
    return (now - new Date(a.publishedAt).getTime()) <= 48 * 3600000;
  });

  const cardBorderClass = (type) => ({
    alert:   styles.annPageCardAlert,
    news:    styles.annPageCardNews,
    event:   styles.annPageCardEvent,
    general: styles.annPageCardGeneral,
  }[type] || styles.annPageCardGeneral);

  return (
    <div className={styles.annPage}>
      <div className={styles.annPageTop}>
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
            <p className={styles.annPageSub}>Announcements from the last 48 hours · auto-expire after 48h</p>
          </div>
          {!loading && fresh.length > 0 && (
            <div className={styles.annPageMeta}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3z"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {fresh.length} active announcement{fresh.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className={styles.annPageGrid}>
          {[1,2,3,4].map(i => <Skeleton key={i} h={160} r={12} />)}
        </div>
      ) : fresh.length === 0 ? (
        <div className={styles.annPageEmpty}>
          <div className={styles.annPageEmptyIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3z"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <h3>No active announcements</h3>
          <p>There are no announcements for your locality in the past 48 hours. Check back later.</p>
        </div>
      ) : (
        <div className={styles.annPageGrid}>
          {fresh.map(a => (
            <div key={a._id} className={`${styles.annPageCard} ${cardBorderClass(a.type)}`}>
              <div className={styles.annPageCardTop}>
                <AnnTypePill type={a.type} />
                <span className={styles.annPageCardAge}>{hoursAgoLabel(a.publishedAt)}</span>
              </div>
              <h3 className={styles.annPageCardTitle}>{a.title}</h3>
              <p className={styles.annPageCardContent}>{a.content}</p>
              <div className={styles.annPageCardFooter}>
                {a.locality ? (
                  <span className={styles.annPageCardLocality}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    {a.locality}
                  </span>
                ) : (
                  <span className={styles.annPageCardLocality}>City-wide</span>
                )}
                <span className={styles.annPageCardDate}>
                  {new Date(a.publishedAt).toLocaleString('en-IN', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
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

/* ═══ QUICK REPORT CATEGORIES ══════════════════════════ */
const QUICK_CATS = [
  {
    label: 'Garbage',
    cat:   'Sanitation & Waste',
    sub:   'Garbage Overflow',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        <path d="M10 11v6M14 11v6"/>
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
      </svg>
    ),
  },
  {
    label: 'Drainage',
    cat:   'Drainage & Water',
    sub:   'Drainage Overflow',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    ),
  },
  {
    label: 'Road',
    cat:   'Road & Infrastructure',
    sub:   'Pothole / Damaged Road',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <rect x="2" y="3" width="20" height="18" rx="2"/>
        <path d="M8 12h8M8 8h8M8 16h4"/>
      </svg>
    ),
  },
  {
    label: 'Street Light',
    cat:   'Electrical & Lighting',
    sub:   'Streetlight Not Working',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <line x1="9" y1="18" x2="15" y2="18"/>
        <line x1="10" y1="22" x2="14" y2="22"/>
        <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
      </svg>
    ),
  },
  {
    label: 'Animal',
    cat:   'Animal Safety / Nuisance',
    sub:   'Stray Dog Issue',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
  {
    label: 'Other',
    cat:   null,
    sub:   null,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
];

/* ═══ MAIN DASHBOARD ════════════════════════════════════ */
const HomeDashboardView = ({ user, onNavigate }) => {
  const [view, setView]                       = useState('home');
  const [location, setLocation]               = useState(null);
  const [locationError, setLocationError]     = useState(null);
  const [localComplaints, setLocalComplaints] = useState([]);
  const [localLoading, setLocalLoading]       = useState(true);
  const [cityData, setCityData]               = useState(null);
  const [cityLoading, setCityLoading]         = useState(true);
  const [announcements, setAnnouncements]     = useState([]);
  const [annLoading, setAnnLoading]           = useState(true);
  const [zonesData, setZonesData]             = useState(null);
  const [expandedId, setExpandedId]           = useState(null);

  const API   = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!navigator.geolocation) { setLocationError('Geolocation not supported'); return; }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setLocation({ lat: coords.latitude, lon: coords.longitude }),
      () => setLocationError('Location access denied'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    if (!location) { if (locationError) setLocalLoading(false); return; }
    fetch(`${API}/complaints/local?lat=${location.lat}&lon=${location.lon}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => setLocalComplaints(d.complaints || []))
      .catch(() => {})
      .finally(() => setLocalLoading(false));
  }, [location, locationError]);

  useEffect(() => {
    fetch(`${API}/complaints/city-stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setCityData(d.stats))
      .catch(() => {}).finally(() => setCityLoading(false));
  }, []);

  useEffect(() => {
    const loc = user?.locality ? `&locality=${user.locality}` : '';
    fetch(`${API}/announcements?limit=20${loc}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        const now = Date.now();
        const fresh = (d.announcements || []).filter(
          a => (now - new Date(a.publishedAt).getTime()) <= 48 * 3600000
        );
        setAnnouncements(fresh);
      })
      .catch(() => {})
      .finally(() => setAnnLoading(false));
  }, []);

  useEffect(() => {
    setZonesData({
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', properties: { name: 'Koramangala', zone: 'red', complaints: 45 },
          geometry: { type: 'Polygon', coordinates: [[[77.618,12.935],[77.62,12.935],[77.62,12.933],[77.618,12.933],[77.618,12.935]]] } },
        { type: 'Feature', properties: { name: 'Jayanagar', zone: 'orange', complaints: 20 },
          geometry: { type: 'Polygon', coordinates: [[[77.585,12.929],[77.587,12.929],[77.587,12.927],[77.585,12.927],[77.585,12.929]]] } },
        { type: 'Feature', properties: { name: 'Indiranagar', zone: 'green', complaints: 8 },
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
      data: cityData.data,
      backgroundColor: cityData.labels.map(l => CAT_COLORS[l] || '#94A3B8'),
      borderRadius: 6,
      borderSkipped: false,
    }],
  } : null;

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#F5F5F5' }, ticks: { color: '#9E9E9E', font: { size: 11 } } },
      x: { grid: { display: false }, ticks: { color: '#9E9E9E', font: { size: 10 }, maxRotation: 30 } },
    },
  };

  const mapCenter = location ? [location.lat, location.lon] : [12.9716, 77.5946];

  const resolved = localComplaints.filter(c => c.status === 'Resolved').length;
  const pending  = localComplaints.filter(c => c.status === 'Pending').length;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  /* ── Announcements full page ── */
  if (view === 'announcements') {
    return (
      <AnnouncementsPage
        announcements={announcements}
        loading={annLoading}
        onBack={() => setView('home')}
      />
    );
  }

  /* ── Home view ── */
  return (
    <div className={styles.page}>

      {/* HERO */}
      <div className={styles.hero}>
        <div>
          <h1 className={styles.heroTitle}>
            {greeting()}, <span className={styles.heroName}>{user.firstName}</span>
          </h1>
          <p className={styles.heroSub}>
            {location
              ? 'Showing civic data near your location'
              : locationError
              ? 'Enable location for local insights'
              : 'Detecting your location…'}
          </p>
        </div>
        <button
          className={styles.annBell}
          onClick={() => setView('announcements')}
          aria-label={`View ${announcements.length} announcement${announcements.length !== 1 ? 's' : ''}`}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3z"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {announcements.length > 0 && (
            <span className={styles.annBellBadge}>{announcements.length}</span>
          )}
        </button>
      </div>

      {/* STATS */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIconBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
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
          <div className={styles.statIconBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
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
          <div className={styles.statIconBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
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

        <button
          className={`${styles.statCard} ${styles.statCardBtn}`}
          onClick={() => setView('announcements')}
        >
          <div className={styles.statIconBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3z"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <div>
            <p className={styles.statNum}>{annLoading ? '—' : announcements.length}</p>
            <p className={styles.statLbl}>Announcements</p>
            <p className={styles.statArrow}>View all →</p>
          </div>
        </button>
      </div>

      {/* QUICK REPORT */}
      <div className={styles.quickReport}>
        <div className={styles.quickReportHead}>
          <span className={styles.quickReportHeadTitle}>Report an Issue</span>
          <span className={styles.quickReportHeadSub}>Select a category to file a complaint instantly</span>
        </div>
        <div className={styles.quickCats}>
          {QUICK_CATS.map(({ label, cat, sub, icon }) => (
            <button
              key={label}
              className={styles.quickCatBtn}
              onClick={() => onNavigate && onNavigate({ type: 'reportComplaint', category: cat, subType: sub })}
            >
              <div className={styles.quickCatIcon}>{icon}</div>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* GRID */}
      <div className={styles.grid}>

        {/* Nearby Complaints */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.cardHeadLeft}>
              <div className={styles.cardHeadIcon}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <span className={styles.cardTitle}>Nearby Complaints</span>
            </div>
            <button
              className={styles.cardAction}
              onClick={() => onNavigate && onNavigate('myComplaints')}
            >
              View all
            </button>
          </div>
          <div className={styles.cardBody}>
            {localLoading ? (
              <div className={styles.skelList}>
                {[1,2,3].map(i => <Skeleton key={i} h={56} r={8} />)}
              </div>
            ) : localComplaints.length === 0 ? (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="8" y1="12" x2="16" y2="12"/>
                  </svg>
                </div>
                <p>No complaints found nearby in the past 2 weeks</p>
              </div>
            ) : (
              <ul className={styles.cList}>
                {localComplaints.slice(0, 5).map(c => (
                  <li
                    key={c._id}
                    className={`${styles.cItem} ${expandedId === c._id ? styles.cItemOpen : ''}`}
                    onClick={() => setExpandedId(expandedId === c._id ? null : c._id)}
                  >
                    <div className={styles.cItemRow}>
                      <div className={styles.cItemLeft}>
                        <span className={styles.cType}>{c.subType || c.category}</span>
                        <StatusBadge status={c.status} />
                      </div>
                      <svg
                        className={`${styles.cChevron} ${expandedId === c._id ? styles.cChevronOpen : ''}`}
                        width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </div>
                    {expandedId === c._id && (
                      <div className={styles.cExpanded}>
                        <p className={styles.cDesc}>{c.description}</p>
                        {c.address && (
                          <p className={styles.cAddr}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2" aria-hidden="true">
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

        {/* Zone Map */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.cardHeadLeft}>
              <div className={styles.cardHeadIcon}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
                  <line x1="9" y1="3" x2="9" y2="18"/>
                  <line x1="15" y1="6" x2="15" y2="21"/>
                </svg>
              </div>
              <span className={styles.cardTitle}>Locality Condition Map</span>
            </div>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.mapWrap}>
              <MapContainer center={mapCenter} zoom={12} scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                {zonesData && (
                  <GeoJSON
                    data={zonesData}
                    style={getZoneStyle}
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
              {[['#EF4444','High Activity'],['#F97316','Moderate'],['#10B981','Low Activity']].map(([c,l]) => (
                <span key={l} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: c }} />
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* City Chart */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.cardHeadLeft}>
              <div className={styles.cardHeadIcon}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                  <line x1="2" y1="20" x2="22" y2="20"/>
                </svg>
              </div>
              <span className={styles.cardTitle}>City-wide Complaint Breakdown</span>
            </div>
          </div>
          <div className={styles.cardBody}>
            {cityLoading ? (
              <Skeleton h={220} r={8} />
            ) : !chartData || chartData.labels.length === 0 ? (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <line x1="18" y1="20" x2="18" y2="10"/>
                    <line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                </div>
                <p>No city data available yet</p>
              </div>
            ) : (
              <div className={styles.chartWrap}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            )}
          </div>
        </div>

        {/* Announcements preview */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.cardHeadLeft}>
              <div className={styles.cardHeadIcon}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3z"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </div>
              <span className={styles.cardTitle}>Local Announcements</span>
              {!annLoading && announcements.length > 0 && (
                <span className={styles.annBadgeCount}>{announcements.length}</span>
              )}
            </div>
            <button className={styles.cardAction} onClick={() => setView('announcements')}>
              See all
            </button>
          </div>
          <div className={styles.cardBody}>
            {annLoading ? (
              <div className={styles.skelList}>
                {[1,2,3].map(i => <Skeleton key={i} h={70} r={8} />)}
              </div>
            ) : announcements.length === 0 ? (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3z"/>
                  </svg>
                </div>
                <p>No announcements in the last 48 hours</p>
              </div>
            ) : (
              <ul className={styles.annList}>
                {announcements.slice(0, 4).map(a => (
                  <li key={a._id} className={styles.annItem}>
                    <div className={styles.annItemTop}>
                      <AnnTypePill type={a.type} />
                      <span className={styles.annAge}>{hoursAgoLabel(a.publishedAt)}</span>
                    </div>
                    <p className={styles.annTitle}>{a.title}</p>
                    <p className={styles.annPreview}>{a.content}</p>
                  </li>
                ))}
                {announcements.length > 4 && (
                  <button className={styles.annShowMore} onClick={() => setView('announcements')}>
                    View {announcements.length - 4} more announcement{announcements.length - 4 !== 1 ? 's' : ''}
                  </button>
                )}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomeDashboardView;