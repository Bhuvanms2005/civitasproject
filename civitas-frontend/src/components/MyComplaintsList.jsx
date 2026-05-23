import React, { useState, useEffect } from 'react';
import styles from './MyComplaintsList.module.css';

const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
const BACKEND = API_URL.replace('/api', '');

const StatusBadge = ({ status }) => {
  const map = { 'Pending': styles.pending, 'Process Ongoing': styles.ongoing, 'Resolved': styles.resolved, 'Rejected': styles.rejected };
  return <span className={`${styles.badge} ${map[status] || styles.pending}`}>{status}</span>;
};

const SeverityDot = ({ severity }) => {
  const colors = { low: '#10B981', moderate: '#F59E0B', high: '#F97316', urgent: '#EF4444' };
  return <span className={styles.severityDot} style={{ background: colors[severity] || '#94A3B8' }} title={severity} />;
};

const MyComplaintsList = ({ user }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reraiseLoading, setReraiseLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const token = localStorage.getItem('token');

  const showToast = (msg, type) => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  const fetchComplaints = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_URL}/complaints/my`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setComplaints(data.complaints || []);
      else setError(data.message || 'Failed to load complaints.');
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const handleReraise = async (id) => {
    if (!window.confirm('Re-raise this complaint? This will notify the admin again.')) return;
    setReraiseLoading(id);
    try {
      const res = await fetch(`${API_URL}/complaints/${id}/reraise`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: '{}' });
      const data = await res.json();
      if (res.ok) { showToast('Complaint re-raised successfully!', 'success'); fetchComplaints(); }
      else showToast(data.message || 'Failed to re-raise.', 'error');
    } catch { showToast('Network error.', 'error'); }
    finally { setReraiseLoading(null); }
  };

  const canReraise = (c) => {
    if (c.status !== 'Pending') return false;
    const hrs = (Date.now() - new Date(c.submittedAt).getTime()) / 36e5;
    return hrs > 48;
  };

  const FILTERS = ['all', 'Pending', 'Process Ongoing', 'Resolved', 'Rejected'];
  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.status === filter);

  return (
    <div className={styles.page}>
      {toast && (
        <div className={`${styles.toast} ${styles[`toast${toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}`]}`}>
          {toast.type === 'success' ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
          {toast.msg}
        </div>
      )}

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>My Complaints</h1>
          <p className={styles.sub}>{complaints.length} total complaint{complaints.length !== 1 ? 's' : ''} submitted</p>
        </div>
        <button className={styles.refreshBtn} onClick={fetchComplaints} disabled={loading}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className={styles.filters}>
        {FILTERS.map(f => (
          <button key={f} className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f}
            <span className={styles.filterCount}>{f === 'all' ? complaints.length : complaints.filter(c => c.status === f).length}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p>Loading your complaints…</p>
        </div>
      ) : error ? (
        <div className={styles.errorWrap}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p>{error}</p>
          <button className={styles.retryBtn} onClick={fetchComplaints}>Try Again</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyWrap}>
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          <h3>{filter === 'all' ? "You haven't submitted any complaints yet" : `No ${filter} complaints`}</h3>
          <p>Use the sidebar to report a civic issue in your area.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map(c => (
            <div key={c._id} className={styles.card}>
              <div className={styles.cardTop} onClick={() => setExpandedId(expandedId === c._id ? null : c._id)}>
                <div className={styles.cardLeft}>
                  <SeverityDot severity={c.severity} />
                  <div>
                    <p className={styles.cardType}>{c.subType || c.category}</p>
                    <p className={styles.cardCategory}>{c.category}</p>
                  </div>
                </div>
                <div className={styles.cardRight}>
                  <StatusBadge status={c.status} />
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`${styles.chevron} ${expandedId === c._id ? styles.chevronUp : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>

              {expandedId === c._id && (
                <div className={styles.cardExpanded}>
                  <p className={styles.cardDesc}>{c.description}</p>
                  <div className={styles.cardMeta}>
                    <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>{c.address}</span>
                    <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>{new Date(c.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    {c.reraisedCount > 0 && <span>Re-raised {c.reraisedCount}×</span>}
                  </div>

                  {c.photo && (
                    <img
                      src={c.photo.startsWith('http') ? c.photo : `${BACKEND}/${c.photo}`}
                      alt="Complaint"
                      className={styles.cardPhoto}
                      onError={e => e.target.style.display = 'none'}
                    />
                  )}

                  {c.updates && c.updates.length > 0 && (
                    <div className={styles.updates}>
                      <p className={styles.updatesTitle}>Latest Update</p>
                      <p className={styles.updateText}>{c.updates[c.updates.length - 1].text}</p>
                      <p className={styles.updateDate}>{new Date(c.updates[c.updates.length - 1].date).toLocaleString()}</p>
                    </div>
                  )}

                  {canReraise(c) && (
                    <button
                      className={styles.reraiseBtn}
                      onClick={() => handleReraise(c._id)}
                      disabled={reraiseLoading === c._id}
                    >
                      {reraiseLoading === c._id ? 'Re-raising…' : 'Re-raise Complaint'}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyComplaintsList;