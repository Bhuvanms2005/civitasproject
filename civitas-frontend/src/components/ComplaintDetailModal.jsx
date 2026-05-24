import React, { useState, useEffect } from 'react';
import styles from './ComplaintDetailModal.module.css';

const API     = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
const BACKEND = API.replace('/api', '');

const STATUS_OPTIONS = ['Pending', 'Process Ongoing', 'Resolved', 'Rejected'];
const SEV_COLORS = { low: '#10B981', moderate: '#F59E0B', high: '#F97316', urgent: '#EF4444' };
const STATUS_CLS = {
  'Pending': styles.badgePending, 'Process Ongoing': styles.badgeOngoing,
  'Resolved': styles.badgeResolved, 'Rejected': styles.badgeRejected,
};

const ComplaintDetailModal = ({ complaintId, onClose, onComplaintUpdated, showToast }) => {
  const [complaint, setComplaint]     = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [assignees, setAssignees]     = useState([]);
  const [selAssignee, setSelAssignee] = useState('');
  const [newStatus, setNewStatus]     = useState('');
  const [adminNote, setAdminNote]     = useState('');
  const [photoFile, setPhotoFile]     = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [working, setWorking]         = useState(false);  // single working flag
  const [msg, setMsg]                 = useState(null);   // { text, type }
  const token = localStorage.getItem('token');

  const notify = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 4000);
    if (showToast) showToast(text, type);
  };

  // Fetch complaint
  useEffect(() => {
    if (!complaintId) return;
    setLoading(true); setError(null); setMsg(null);
    fetch(`${API}/admin/complaints/${complaintId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.complaint) {
          setComplaint(d.complaint);
          setNewStatus(d.complaint.status);
          if (d.complaint.assignedTo) setSelAssignee(d.complaint.assignedTo._id);
        } else setError(d.message || 'Not found.');
      })
      .catch(() => setError('Network error.'))
      .finally(() => setLoading(false));
  }, [complaintId]);

  // Fetch assignees
  useEffect(() => {
    fetch(`${API}/users/assignees`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setAssignees(d.assignees || []))
      .catch(() => {});
  }, []);

  const handleAssign = async () => {
    if (!selAssignee) { notify('Select an assignee.', 'error'); return; }
    setWorking(true);
    try {
      const res  = await fetch(`${API}/admin/complaints/${complaintId}/assign`, {
        method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedToId: selAssignee }),
      });
      const data = await res.json();
      if (res.ok) { setComplaint(data.complaint); notify('Assigned successfully!'); if (onComplaintUpdated) onComplaintUpdated(); }
      else notify(data.message || 'Failed to assign.', 'error');
    } catch { notify('Network error.', 'error'); }
    finally { setWorking(false); }
  };

  const handleUpdateStatus = async () => {
    if (newStatus === complaint.status && !adminNote.trim()) { notify('No changes detected.', 'error'); return; }
    setWorking(true);
    try {
      const res  = await fetch(`${API}/admin/complaints/${complaintId}/status`, {
        method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, note: adminNote }),
      });
      const data = await res.json();
      if (res.ok) { setComplaint(data.complaint); setAdminNote(''); notify('Status updated!'); if (onComplaintUpdated) onComplaintUpdated(); }
      else notify(data.message || 'Failed to update.', 'error');
    } catch { notify('Network error.', 'error'); }
    finally { setWorking(false); }
  };

  const handleUploadPhoto = async () => {
    if (!photoFile) { notify('Select a photo first.', 'error'); return; }
    setWorking(true);
    const fd = new FormData();
    fd.append('beforeAfterPhoto', photoFile);
    try {
      const res  = await fetch(`${API}/admin/complaints/${complaintId}/photos`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
      });
      const data = await res.json();
      if (res.ok) {
        setComplaint(p => ({ ...p, beforeAfterPhotos: [...(p.beforeAfterPhotos || []), data.photo] }));
        setPhotoFile(null); setPhotoPreview(null);
        notify('Photo uploaded!');
        if (onComplaintUpdated) onComplaintUpdated();
      } else notify(data.message || 'Upload failed.', 'error');
    } catch { notify('Network error.', 'error'); }
    finally { setWorking(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Permanently delete this complaint? This cannot be undone.')) return;
    setWorking(true);
    try {
      const res = await fetch(`${API}/admin/complaints/${complaintId}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        notify('Complaint deleted.');
        if (onComplaintUpdated) onComplaintUpdated();
        setTimeout(onClose, 1200);
      } else {
        const d = await res.json();
        notify(d.message || 'Delete failed.', 'error');
      }
    } catch { notify('Network error.', 'error'); }
    finally { setWorking(false); }
  };

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        {/* Modal header */}
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Complaint Details</h2>
            {complaint && <p className={styles.modalId}>ID: #{complaint._id?.slice(-8).toUpperCase()}</p>}
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Inline message */}
        {msg && (
          <div className={`${styles.msg} ${msg.type === 'success' ? styles.msgSuccess : styles.msgError}`}>
            {msg.type === 'success'
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
            {msg.text}
          </div>
        )}

        <div className={styles.modalBody}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>Loading complaint…</p>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <p>{error}</p>
              <button className={styles.btnSecondary} onClick={onClose}>Close</button>
            </div>
          ) : complaint ? (
            <div className={styles.twoCol}>
              {/* LEFT — details */}
              <div className={styles.detailCol}>
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Complaint Info</h3>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailRow}><span className={styles.detailKey}>Category</span><span className={styles.detailVal}>{complaint.category}</span></div>
                    <div className={styles.detailRow}><span className={styles.detailKey}>Issue Type</span><span className={styles.detailVal}>{complaint.subType}</span></div>
                    <div className={styles.detailRow}><span className={styles.detailKey}>Severity</span>
                      <span className={styles.sevChip} style={{ background: SEV_COLORS[complaint.severity] + '20', color: SEV_COLORS[complaint.severity] }}>{complaint.severity}</span>
                    </div>
                    <div className={styles.detailRow}><span className={styles.detailKey}>Status</span>
                      <span className={`${styles.badge} ${STATUS_CLS[complaint.status] || styles.badgePending}`}>{complaint.status}</span>
                    </div>
                    <div className={styles.detailRow}><span className={styles.detailKey}>Re-raised</span><span className={styles.detailVal}>{complaint.reraisedCount ?? 0}×</span></div>
                    <div className={styles.detailRow}><span className={styles.detailKey}>Submitted</span><span className={styles.detailVal}>{new Date(complaint.submittedAt).toLocaleString()}</span></div>
                    {complaint.submittedBy && (
                      <div className={styles.detailRow}><span className={styles.detailKey}>By</span><span className={styles.detailVal}>{complaint.submittedBy.firstName} {complaint.submittedBy.lastName} · {complaint.submittedBy.email}</span></div>
                    )}
                    {complaint.assignedTo && (
                      <div className={styles.detailRow}><span className={styles.detailKey}>Assigned To</span><span className={styles.detailVal}>{complaint.assignedTo.firstName} {complaint.assignedTo.lastName}</span></div>
                    )}
                  </div>
                  <div className={styles.descBlock}>
                    <span className={styles.detailKey}>Description</span>
                    <p className={styles.descText}>{complaint.description}</p>
                  </div>
                  {complaint.address && (
                    <div className={styles.addrBlock}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {complaint.address}
                    </div>
                  )}
                </section>

                {/* Complaint photo */}
                {complaint.photo && (
                  <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Complaint Photo</h3>
                    <img src={`${BACKEND}/${complaint.photo}`} alt="Complaint" className={styles.mainPhoto}
                      onError={e => e.target.style.display = 'none'} />
                  </section>
                )}

                {/* Updates */}
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Update History</h3>
                  {complaint.updates?.length > 0 ? (
                    <ul className={styles.updateList}>
                      {complaint.updates.map((u, i) => (
                        <li key={i} className={styles.updateItem}>
                          <div className={styles.updateDot} />
                          <div>
                            <p className={styles.updateText}>{u.text}</p>
                            <p className={styles.updateMeta}>{new Date(u.date).toLocaleString()}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : <p className={styles.noData}>No updates yet.</p>}
                </section>

                {/* Before/After photos */}
                {complaint.beforeAfterPhotos?.length > 0 && (
                  <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Before/After Photos</h3>
                    <div className={styles.photoGrid}>
                      {complaint.beforeAfterPhotos.map((p, i) => (
                        <div key={i} className={styles.photoItem}>
                          <img src={`${BACKEND}/${p.url}`} alt={`Photo ${i+1}`} className={styles.thumbPhoto} onError={e => e.target.style.display = 'none'} />
                          <p className={styles.photoMeta}>{new Date(p.uploadedAt).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* RIGHT — actions */}
              <div className={styles.actionCol}>
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Assign To</h3>
                  <select className={styles.select} value={selAssignee} onChange={e => setSelAssignee(e.target.value)}>
                    <option value="">Select Department / NGO…</option>
                    {assignees.map(a => (
                      <option key={a._id} value={a._id}>
                        {a.firstName} {a.lastName || ''} ({a.role}) · {a.email}
                      </option>
                    ))}
                  </select>
                  <button className={styles.btnPrimary} onClick={handleAssign} disabled={working || !selAssignee}>
                    {working ? <span className={styles.btnSpinner} /> : null}
                    Assign
                  </button>
                </section>

                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Update Status</h3>
                  <select className={styles.select} value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <textarea
                    className={styles.textarea}
                    placeholder="Add admin notes (optional)…"
                    value={adminNote}
                    onChange={e => setAdminNote(e.target.value)}
                    rows={3}
                  />
                  <button className={styles.btnPrimary} onClick={handleUpdateStatus} disabled={working}>
                    {working ? <span className={styles.btnSpinner} /> : null}
                    Save Status
                  </button>
                </section>

                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Upload Resolution Photo</h3>
                  {photoPreview && <img src={photoPreview} alt="Preview" className={styles.uploadPreview} />}
                  <label className={styles.fileLabel}>
                    <input type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => {
                        const f = e.target.files[0];
                        if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); }
                      }}
                    />
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    {photoFile ? photoFile.name : 'Choose photo…'}
                  </label>
                  <button className={styles.btnPrimary} onClick={handleUploadPhoto} disabled={working || !photoFile}>
                    {working ? <span className={styles.btnSpinner} /> : null}
                    Upload
                  </button>
                </section>

                <section className={`${styles.section} ${styles.dangerSection}`}>
                  <h3 className={`${styles.sectionTitle} ${styles.dangerTitle}`}>Danger Zone</h3>
                  <p className={styles.dangerDesc}>Permanently removes this complaint and all associated data.</p>
                  <button className={styles.btnDanger} onClick={handleDelete} disabled={working}>
                    Delete Complaint
                  </button>
                </section>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetailModal;