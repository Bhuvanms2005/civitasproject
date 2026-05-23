import React, { useState, useEffect, useRef } from 'react';
import InteractiveMap from './InteractiveMap';
import styles from './ComplaintForm.module.css';

const SEVERITIES = [
  { value: 'low', label: 'Low', desc: 'Minor inconvenience', color: '#10B981' },
  { value: 'moderate', label: 'Moderate', desc: 'Standard issue', color: '#F59E0B' },
  { value: 'high', label: 'High', desc: 'Major concern', color: '#F97316' },
  { value: 'urgent', label: 'Urgent', desc: 'Safety hazard', color: '#EF4444' },
];

const ComplaintForm = ({ user, category, subType }) => {
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [address, setAddress] = useState('');
  const [mapPinLocation, setMapPinLocation] = useState(null);
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('moderate');
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [similarComplaints, setSimilarComplaints] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  const showToast = (msg, type) => { setToast({ msg, type }); setTimeout(() => setToast(null), 5000); };

  useEffect(() => {
    if (category && subType) setDescription(`${subType} issue reported in ${category}.`);
    else if (category) setDescription(`Issue in ${category} category.`);
    else setDescription('');
  }, [category, subType]);

  // Fetch similar complaints when location+description ready
  useEffect(() => {
    if (!mapPinLocation || description.length < 15 || !category) return;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/complaints/similar?lat=${mapPinLocation.lat}&lon=${mapPinLocation.lon}&description=${encodeURIComponent(description)}&category=${encodeURIComponent(category)}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok) setSimilarComplaints(data.similarComplaints || data.similar || []);
      } catch {}
    }, 800);
    return () => clearTimeout(t);
  }, [mapPinLocation, description, category]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) { setLocationError('Geolocation not supported'); return; }
    setLocationLoading(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const loc = { lat: coords.latitude, lon: coords.longitude };
        setMapPinLocation(loc);
        setAddress(`${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`);
        setLocationLoading(false);
      },
      () => { setLocationError('Could not get location. Please pin manually on map.'); setLocationLoading(false); },
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
    if (file.size > 5 * 1024 * 1024) { showToast('File too large. Max 5MB.', 'error'); return; }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSupportComplaint = async (id) => {
    try {
      const res = await fetch(`${API}/complaints/${id}/support`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      const data = await res.json();
      if (res.ok) {
        setSimilarComplaints(prev => prev.map(c => c._id === id ? { ...c, supportedCount: data.supportCount, userSupported: true } : c));
        showToast('You\'re now supporting this complaint!', 'success');
      } else showToast(data.message || 'Failed to support.', 'error');
    } catch { showToast('Network error.', 'error'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photo) { showToast('Please upload a photo of the issue.', 'error'); return; }
    if (!mapPinLocation) { showToast('Please pin the location on the map.', 'error'); return; }
    if (!description.trim()) { showToast('Please describe the issue.', 'error'); return; }

    setSubmitting(true);
    const fd = new FormData();
    fd.append('category', category || '');
    fd.append('subType', subType || '');
    fd.append('description', description);
    fd.append('address', address);
    fd.append('latitude', mapPinLocation.lat);
    fd.append('longitude', mapPinLocation.lon);
    fd.append('severity', severity);
    fd.append('photo', photo);

    try {
      const res = await fetch(`${API}/complaints`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (res.ok) {
        showToast('Complaint submitted successfully! We\'ll keep you updated.', 'success');
        setPhoto(null); setPhotoPreview(null); setAddress('');
        setMapPinLocation(null); setSimilarComplaints([]);
        setDescription(category && subType ? `${subType} issue reported in ${category}.` : '');
        setSeverity('moderate');
      } else showToast(data.message || 'Submission failed. Please try again.', 'error');
    } catch { showToast('Network error. Please try again.', 'error'); }
    finally { setSubmitting(false); }
  };

  if (!category) {
    return (
      <div className={styles.noCategory}>
        <div className={styles.noCategoryIcon}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <h2>Select a Complaint Category</h2>
        <p>Use the sidebar menu to choose a complaint type and then fill out this form.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {toast && (
        <div className={`${styles.toast} ${styles[`toast${toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}`]}`}>
          {toast.type === 'success'
            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
          {toast.msg}
        </div>
      )}

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Report a Complaint</h1>
          <div className={styles.breadcrumb}>
            <span>{category}</span>
            {subType && <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg><span>{subType}</span></>}
          </div>
        </div>
      </div>

      {/* Similar complaints alert */}
      {similarComplaints.length > 0 && (
        <div className={styles.similarAlert}>
          <div className={styles.similarAlertHeader}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <strong>Similar complaints already exist nearby</strong>
          </div>
          <p className={styles.similarSubtitle}>Instead of filing a new one, consider supporting an existing report:</p>
          <ul className={styles.similarList}>
            {similarComplaints.map(c => (
              <li key={c._id} className={styles.similarItem}>
                <div className={styles.similarInfo}>
                  <span className={styles.similarType}>{c.category}</span>
                  <p className={styles.similarDesc}>{c.description}</p>
                </div>
                <button
                  className={`${styles.supportBtn} ${c.userSupported ? styles.supportBtnDone : ''}`}
                  onClick={() => handleSupportComplaint(c._id)}
                  disabled={c.userSupported}
                >
                  {c.userSupported ? 'Supported' : `Support (${c.supportedCount || 0})`}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          {/* Left column */}
          <div className={styles.col}>
            {/* Photo upload */}
            <div className={styles.field}>
              <label className={styles.label}>
                Photo Evidence <span className={styles.required}>*</span>
              </label>
              {photoPreview ? (
                <div className={styles.photoPreviewWrap}>
                  <img src={photoPreview} alt="Preview" className={styles.photoPreview} />
                  <button type="button" className={styles.photoRemove} onClick={() => { setPhoto(null); setPhotoPreview(null); }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Remove
                  </button>
                </div>
              ) : (
                <div className={styles.uploadArea} onClick={() => fileInputRef.current?.click()}>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <p className={styles.uploadTitle}>Click to upload photo</p>
                  <p className={styles.uploadSub}>JPG, PNG, WEBP up to 5MB</p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="desc">
                Description <span className={styles.required}>*</span>
              </label>
              <textarea
                id="desc"
                className={styles.textarea}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe the issue clearly — what you see, how long it's been there, any safety concerns..."
                rows={5}
                required
              />
              <p className={styles.charCount}>{description.length}/500</p>
            </div>

            {/* Severity */}
            <div className={styles.field}>
              <label className={styles.label}>Severity Level <span className={styles.required}>*</span></label>
              <div className={styles.severityGrid}>
                {SEVERITIES.map(s => (
                  <button
                    key={s.value}
                    type="button"
                    className={`${styles.severityBtn} ${severity === s.value ? styles.severityActive : ''}`}
                    style={{ '--sev-color': s.color }}
                    onClick={() => setSeverity(s.value)}
                  >
                    <span className={styles.severityDot} style={{ background: s.color }} />
                    <span className={styles.severityLabel}>{s.label}</span>
                    <span className={styles.severityDesc}>{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className={styles.col}>
            {/* Location */}
            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label className={styles.label}>
                  Location <span className={styles.required}>*</span>
                </label>
                <button type="button" className={styles.gpsBtn} onClick={getCurrentLocation} disabled={locationLoading}>
                  {locationLoading ? (
                    <span className={styles.gpsSpinner} />
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                  )}
                  {locationLoading ? 'Detecting…' : 'Use My Location'}
                </button>
              </div>

              <input
                type="text"
                className={styles.input}
                placeholder="Or type an address"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
              {locationError && <p className={styles.fieldError}>{locationError}</p>}

              <div className={styles.mapWrap}>
                <InteractiveMap onLocationChange={handleMapPin} position={mapPinLocation} />
              </div>
              {mapPinLocation && (
                <p className={styles.pinnedNote}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  Pinned at {mapPinLocation.lat.toFixed(4)}, {mapPinLocation.lon.toFixed(4)}
                </p>
              )}
              {!mapPinLocation && <p className={styles.mapHint}>Click on the map to pin the exact location of the issue</p>}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className={styles.submitRow}>
          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? <><span className={styles.btnSpinner} />Submitting…</> : 'Submit Complaint'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComplaintForm;