import React, { useState, useEffect, useCallback } from 'react';
import ComplaintDetailModal from './ComplaintDetailModal';
import styles from './ComplaintManagementView.module.css';

const BACKEND = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '');
const API     =  process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const STATUS_STYLES = {
  'Pending':         { cls: styles.badgePending,  label: 'Pending' },
  'Process Ongoing': { cls: styles.badgeOngoing,  label: 'In Progress' },
  'Resolved':        { cls: styles.badgeResolved, label: 'Resolved' },
  'Rejected':        { cls: styles.badgeRejected, label: 'Rejected' },
};
const SEV_COLORS = { low: '#10B981', moderate: '#F59E0B', high: '#F97316', urgent: '#EF4444' };

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES['Pending'];
  return <span className={`${styles.badge} ${s.cls}`}>{s.label}</span>;
};

const Skeleton = () => (
  <div className={styles.skeletonCard}>
    <div className={styles.sk} style={{ height: 14, width: '40%' }} />
    <div className={styles.sk} style={{ height: 12, width: '70%', marginTop: 8 }} />
    <div className={styles.sk} style={{ height: 12, width: '55%', marginTop: 6 }} />
  </div>
);

const FILTERS  = ['All', 'Pending', 'Process Ongoing', 'Resolved', 'Rejected'];
const SORT_OPS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'severity', label: 'Severity (high→low)' },
];
const SEV_ORDER = { urgent: 4, high: 3, moderate: 2, low: 1 };

const ComplaintManagementView = ({ user, showToast }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [selected, setSelected]     = useState(null);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilter]   = useState('All');
  const [sort, setSort]             = useState('newest');
  const [deletingId, setDeletingId] = useState(null);
  const token = localStorage.getItem('token');

  const fetchComplaints = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`${API}/admin/complaints`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setComplaints(data.complaints || []);
      else setError(data.message || 'Failed to load complaints.');
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Permanently delete this complaint?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API}/admin/complaints/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setComplaints(prev => prev.filter(c => c._id !== id));
        if (showToast) showToast('Complaint deleted.', 'success');
      } else {
        const d = await res.json();
        if (showToast) showToast(d.message || 'Failed to delete.', 'error');
      }
    } catch { if (showToast) showToast('Network error.', 'error'); }
    finally { setDeletingId(null); }
  };

  // Filter + search + sort
  const filtered = complaints
    .filter(c => filterStatus === 'All' || c.status === filterStatus)
    .filter(c => !search || [c.subType, c.category, c.description, c.address,
      c.submittedBy?.firstName, c.submittedBy?.lastName, c.submittedBy?.email]
      .some(v => v && v.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => {
      if (sort === 'oldest')   return new Date(a.submittedAt) - new Date(b.submittedAt);
      if (sort === 'severity') return (SEV_ORDER[b.severity] || 0) - (SEV_ORDER[a.severity] || 0);
      return new Date(b.submittedAt) - new Date(a.submittedAt);
    });

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === 'All' ? complaints.length : complaints.filter(c => c.status === f).length;
    return acc;
  }, {});

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Complaint Management</h1>
          <p className={styles.pageSub}>{complaints.length} total complaints in the system</p>
        </div>
        <button className={styles.refreshBtn} onClick={fetchComplaints} disabled={loading}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          Refresh
        </button>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            className={styles.searchInput}
            placeholder="Search by type, category, description, user…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className={styles.searchClear} onClick={() => setSearch('')}>✕</button>}
        </div>
        <select className={styles.sortSelect} value={sort} onChange={e => setSort(e.target.value)}>
          {SORT_OPS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Filter tabs */}
      <div className={styles.filters}>
        {FILTERS.map(f => (
          <button
            key={f}
            className={`${styles.filterBtn} ${filterStatus === f ? styles.filterActive : ''}`}
            onClick={() => setFilter(f)}
          >
            {f} <span className={styles.filterCount}>{counts[f]}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className={styles.grid}>{[1,2,3,4,5,6].map(i => <Skeleton key={i} />)}</div>
      ) : error ? (
        <div className={styles.errorState}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p>{error}</p>
          <button className={styles.retryBtn} onClick={fetchComplaints}>Try Again</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <h3>{search ? 'No results found' : 'No complaints yet'}</h3>
          <p>{search ? 'Try adjusting your search or filters.' : 'Complaints will appear here once submitted.'}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map(c => (
            <div key={c._id} className={styles.card} onClick={() => setSelected(c._id)}>
              <div className={styles.cardTop}>
                <div className={styles.cardTopLeft}>
                  <span className={styles.sevDot} style={{ background: SEV_COLORS[c.severity] || '#94A3B8' }} title={c.severity} />
                  <span className={styles.cardType}>{c.subType || c.category}</span>
                </div>
                <StatusBadge status={c.status} />
              </div>
              <p className={styles.cardDesc}>{c.description}</p>
              <div className={styles.cardMeta}>
                {c.address && (
                  <span className={styles.cardMetaItem}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {c.address}
                  </span>
                )}
                {c.submittedBy && (
                  <span className={styles.cardMetaItem}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    {c.submittedBy.firstName} {c.submittedBy.lastName}
                  </span>
                )}
                <span className={styles.cardMetaItem}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {new Date(c.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              {c.photo && (
                <img
                  src={`${BACKEND}/${c.photo}`}
                  alt="Complaint"
                  className={styles.cardPhoto}
                  onError={e => e.target.style.display = 'none'}
                />
              )}
              <div className={styles.cardActions}>
                <button className={styles.viewBtn} onClick={e => { e.stopPropagation(); setSelected(c._id); }}>
                  View & Manage
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={e => handleDelete(c._id, e)}
                  disabled={deletingId === c._id}
                >
                  {deletingId === c._id ? '…' : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <ComplaintDetailModal
          complaintId={selected}
          onClose={() => setSelected(null)}
          onComplaintUpdated={fetchComplaints}
          showToast={showToast}
        />
      )}
    </div>
  );
};

export default ComplaintManagementView;