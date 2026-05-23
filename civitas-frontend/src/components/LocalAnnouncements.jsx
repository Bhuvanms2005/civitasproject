import React, { useState, useEffect } from 'react';
import styles from './LocalAnnouncements.module.css';

export default function LocalAnnouncements({ setView }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication required to fetch announcements.');
        setLoading(false);
        return;
      }

      const localityParam = user?.locality
        ? `?locality=${user.locality}`
        : '';

      try {
        const res = await fetch(
          `${API_BASE_URL}/announcements${localityParam}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (res.ok) {
          setAnnouncements(data.announcements || []);
        } else {
          setError(data.message || 'Failed to fetch announcements.');
        }
      } catch (err) {
        console.error(err);
        setError('Network error fetching announcements.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [API_BASE_URL, user?.locality]);

  return (
    <div className={styles.announcementsPage}>
      <div className={styles.topBar}>
        <button
          className={styles.backBtn}
          onClick={() => setView('home')}
        >
          ← Back
        </button>

        <h2>📢 Local Announcements</h2>
      </div>

      {loading && <p>Loading announcements...</p>}

      {error && (
        <p className={styles.error}>
          {error}
        </p>
      )}

      {!loading &&
        !error &&
        announcements.length === 0 && (
          <p>No announcements found in your locality.</p>
        )}

      {!loading &&
        !error &&
        announcements.length > 0 && (
          <ul className={styles.announcementList}>
            {announcements.map((a) => (
              <li
                key={a._id}
                className={styles.announcementItem}
              >
                <div className={styles.announcementHeader}>
                  <strong>{a.title}</strong>

                  <span className={styles.type}>
                    {a.type}
                  </span>
                </div>

                <p>{a.content}</p>

                <small>
                  {new Date(
                    a.publishedAt
                  ).toLocaleString()}
                </small>
              </li>
            ))}
          </ul>
        )}
    </div>
  );
}