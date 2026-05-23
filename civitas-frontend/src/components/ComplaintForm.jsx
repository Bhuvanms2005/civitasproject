import React, { useState, useEffect, useRef } from 'react';
import InteractiveMap from './InteractiveMap';
import styles from './ComplaintForm.module.css';

const SEVERITIES = [
  { value: 'low',      label: 'Low',      desc: 'Minor inconvenience', color: '#10B981' },
  { value: 'moderate', label: 'Moderate', desc: 'Standard issue',      color: '#F59E0B' },
  { value: 'high',     label: 'High',     desc: 'Major concern',       color: '#F97316' },
  { value: 'urgent',   label: 'Urgent',   desc: 'Safety hazard',       color: '#EF4444' },
];

/* ════════════════════════════════════════════════════════
   ComplaintForm
   Props:
     user       — logged-in user object
     category   — pre-selected category string (from sidebar)
     subType    — pre-selected sub-type string (from sidebar)
     onNavigate — callback(key) to navigate to another view
   ════════════════════════════════════════════════════════ */
const ComplaintForm = ({ user, category, subType, onNavigate }) => {
  const [photo,            setPhoto]            = useState(null);
  const [photoPreview,     setPhotoPreview]     = useState(null);
  const [address,          setAddress]          = useState('');
  const [mapPinLocation,   setMapPinLocation]   = useState(null);
  const [description,      setDescription]      = useState('');
  const [severity,         setSeverity]         = useState('moderate');
  const [locLoading,       setLocLoading]       = useState(false);
  const [locError,         setLocError]         = useState(null);
  const [similar,          setSimilar]          = useState([]);
  const [submitting,       setSubmitting]       = useState(false);
  const [submitSuccess,    setSubmitSuccess]    = useState(false); // redirect state
  const [inlineError,      setInlineError]      = useState('');
  const fileRef = useRef(null);

  const API   = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  /* Reset description when category changes */
  useEffect(() => {
    if (category && subType) setDescription(`${subType} issue in ${category}.`);
    else if (category)       setDescription(`Issue in ${category} category.`);
    else                     setDescription('');
    setSimilar([]);
    setInlineError('');
  }, [category, subType]);

  /* Fetch similar complaints (debounced) */
  useEffect(() => {
    if (!mapPinLocation || description.length < 15 || !category) return;
    const t = setTimeout(async () => {
      try {
        const url = `${API}/complaints/similar?lat=${mapPinLocation.lat}&lon=${mapPinLocation.lon}`
          + `&description=${encodeURIComponent(description)}&category=${encodeURIComponent(category)}`;
        const res  = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok) setSimilar(data.similarComplaints || data.similar || []);
      } catch {}
    }, 900);
    return () => clearTimeout(t);
  }, [mapPinLocation, description, category]);

  /* GPS */
  const getGPS = () => {
    if (!navigator.geolocation) { setLocError('Geolocation not supported'); return; }
    setLocLoading(true); setLocError(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const loc = { lat: coords.latitude, lon: coords.longitude };
        setMapPinLocation(loc);
        setAddress(`${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`);
        setLocLoading(false);
      },
      () => { setLocError('Could not get location. Pin manually on map.'); setLocLoading(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleMapPin = (latlng) => {
    const loc = { lat: latlng.lat, lon: latlng.lng };
    setMapPinLocation(loc);
    setAddress(`${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setInlineError('File too large. Max 5 MB.'); return; }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setInlineError('');
  };

  const handleSupport = async (id) => {
    try {
      const res  = await fetch(`${API}/complaints/${id}/support`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: '{}',
      });
      const data = await res.json();
      if (res.ok) {
        setSimilar(prev =>
          prev.map(c =>
            c._id === id ? { ...c, supportedCount: data.supportCount, userSupported: true } : c
          )
        );
      }
    } catch {}
  };

  /* ── SUBMIT — on success navigate to myComplaints ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setInlineError('');

    if (!photo)          { setInlineError('Please upload a photo of the issue.'); return; }
    if (!mapPinLocation) { setInlineError('Please pin the location on the map.'); return; }
    if (!description.trim()) { setInlineError('Please describe the issue.'); return; }

    setSubmitting(true);
    const fd = new FormData();
    fd.append('category',    category  || '');
    fd.append('subType',     subType   || '');
    fd.append('description', description);
    fd.append('address',     address);
    fd.append('latitude',    mapPinLocation.lat);
    fd.append('longitude',   mapPinLocation.lon);
    fd.append('severity',    severity);
    fd.append('photo',       photo);

    try {
      const res  = await fetch(`${API}/complaints`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
        body:    fd,
      });
      const data = await res.json();

      if (res.ok) {
        /* Show a brief success screen, then navigate to My Complaints */
        setSubmitSuccess(true);
        setTimeout(() => {
          if (onNavigate) onNavigate('myComplaints');
        }, 1800);
      } else {
        setInlineError(data.message || 'Submission failed. Please try again.');
      }
    } catch {
      setInlineError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── No category selected ── */
  if (!category) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIllus}>
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <h2>Select a category to continue</h2>
        <p>Open the sidebar and choose a complaint type to start filling out this form.</p>
      </div>
    );
  }

  /* ── Submission success screen ── */
  if (submitSuccess) {
    return (
      <div className={styles.successScreen}>
        <div className={styles.successIcon}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 className={styles.successTitle}>Complaint submitted!</h2>
        <p className={styles.successSub}>
          We've received your report. You'll be redirected to your complaints list now.
        </p>
        <div className={styles.successBar} />
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Report a Complaint</h1>
          <div className={styles.breadcrumb}>
            <span>{category}</span>
            {subType && (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                <span>{subType}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Similar complaints banner */}
      {similar.length > 0 && (
        <div className={styles.similarBanner}>
          <div className={styles.similarBannerHead}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <strong>Similar complaints already exist nearby</strong>
          </div>
          <p className={styles.similarBannerSub}>
            Consider supporting an existing report instead of filing a new one:
          </p>
          <ul className={styles.similarList}>
            {similar.map(c => (
              <li key={c._id} className={styles.similarItem}>
                <div className={styles.similarInfo}>
                  <span className={styles.similarCat}>{c.category}</span>
                  <p className={styles.similarDesc}>{c.description}</p>
                </div>
                <button
                  className={`${styles.supportBtn} ${c.userSupported ? styles.supportedBtn : ''}`}
                  onClick={() => handleSupport(c._id)}
                  disabled={c.userSupported}
                >
                  {c.userSupported
                    ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Supported</>
                    : `Support (${c.supportedCount || 0})`}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.twoCol}>

          {/* LEFT */}
          <div className={styles.col}>

            {/* Photo */}
            <div className={styles.field}>
              <label className={styles.label}>
                Photo Evidence <span className={styles.req}>*</span>
              </label>
              {photoPreview ? (
                <div className={styles.previewWrap}>
                  <img src={photoPreview} alt="Preview" className={styles.previewImg} />
                  <button
                    type="button"
                    className={styles.removePhoto}
                    onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    Remove
                  </button>
                </div>
              ) : (
                <div className={styles.uploadZone} onClick={() => fileRef.current?.click()}>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={{ display: 'none' }}
                  />
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <p className={styles.uploadPrimary}>Click to upload a photo</p>
                  <p className={styles.uploadSecondary}>JPG, PNG, WEBP · max 5 MB</p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="desc">
                Description <span className={styles.req}>*</span>
              </label>
              <textarea
                id="desc"
                className={styles.textarea}
                value={description}
                onChange={e => setDescription(e.target.value.slice(0, 500))}
                placeholder="Describe the issue — what you see, how long it's been there, any safety concern…"
                rows={5}
                required
              />
              <p className={styles.charCount}>{description.length}/500</p>
            </div>

            {/* Severity */}
            <div className={styles.field}>
              <label className={styles.label}>
                Severity <span className={styles.req}>*</span>
              </label>
              <div className={styles.sevGrid}>
                {SEVERITIES.map(s => (
                  <button
                    key={s.value}
                    type="button"
                    className={`${styles.sevBtn} ${severity === s.value ? styles.sevActive : ''}`}
                    style={{ '--c': s.color }}
                    onClick={() => setSeverity(s.value)}
                  >
                    <span className={styles.sevDot} style={{ background: s.color }} />
                    <span className={styles.sevLabel}>{s.label}</span>
                    <span className={styles.sevDesc}>{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className={styles.col}>

            {/* Location */}
            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label className={styles.label}>
                  Location <span className={styles.req}>*</span>
                </label>
                <button
                  type="button"
                  className={styles.gpsBtn}
                  onClick={getGPS}
                  disabled={locLoading}
                >
                  {locLoading
                    ? <span className={styles.gpsSpinner} />
                    : <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="16"/>
                        <line x1="8" y1="12" x2="16" y2="12"/>
                      </svg>}
                  {locLoading ? 'Detecting…' : 'Use My Location'}
                </button>
              </div>

              <input
                type="text"
                className={styles.input}
                placeholder="Or type an address / landmark"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />

              {locError && <p className={styles.fieldErr}>{locError}</p>}

              <div className={styles.mapWrap}>
                <InteractiveMap onLocationChange={handleMapPin} position={mapPinLocation} />
              </div>

              {mapPinLocation ? (
                <p className={styles.pinned}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  Pinned at {mapPinLocation.lat.toFixed(4)}, {mapPinLocation.lon.toFixed(4)}
                </p>
              ) : (
                <p className={styles.mapHint}>
                  Click on the map to pin the exact location of the issue
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Inline error */}
        {inlineError && (
          <div className={styles.inlineError}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {inlineError}
          </div>
        )}

        {/* Submit */}
        <div className={styles.submitRow}>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={submitting}
          >
            {submitting ? (
              <><span className={styles.btnSpinner} /> Submitting…</>
            ) : (
              'Submit Complaint'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComplaintForm;