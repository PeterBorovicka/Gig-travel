import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getVenue } from '../api';

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function VenueDetailPage() {
  const { id } = useParams();
  const [venue, setVenue] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getVenue(id);
        setVenue(data);
        setEvents(Array.isArray(data.events) ? data.events : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return <div className="loading"><div className="spinner" /><span>Loading venue…</span></div>;
  }

  if (error) {
    return (
      <div className="error-message">
        <h3>⚠️ Error</h3>
        <p>{error}</p>
        <Link to="/venues" className="btn btn-secondary mt-2">← Back to Venues</Link>
      </div>
    );
  }

  if (!venue) return null;

  return (
    <>
      <div className="detail-header">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="separator">/</span>
            <Link to="/venues">Venues</Link>
            <span className="separator">/</span>
            <span>{venue.name}</span>
          </div>
          <h1>🏟️ {venue.name}</h1>
          <p className="text-muted">
            📍 {venue.city}{venue.country ? `, ${venue.country}` : ''}
            {venue.capacity ? ` · 👥 Capacity: ${venue.capacity.toLocaleString()}` : ''}
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="detail-grid">
            <div>
              {venue.description && (
                <div className="detail-box mb-3">
                  <h3>📋 About this Venue</h3>
                  <p className="text-muted">{venue.description}</p>
                </div>
              )}

              {venue.address && (
                <div className="detail-box mb-3">
                  <h3>📍 Address</h3>
                  <p className="text-muted">{venue.address}</p>
                </div>
              )}

              <div className="detail-box">
                <h3>🎫 Upcoming Events</h3>
                {events.length === 0 ? (
                  <p className="text-muted">No upcoming events at this venue.</p>
                ) : (
                  <div className="grid grid-2" style={{ marginTop: '1rem' }}>
                    {events.map((ev) => (
                      <Link
                        to={`/events/${ev.id}`}
                        key={ev.id}
                        className="card"
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <div className="card-body">
                          <h3 className="card-title">{ev.title}</h3>
                          {ev.artist && <p className="card-text">🎤 {ev.artist}</p>}
                          <div className="card-meta">
                            <span>📅 {formatDate(ev.date)}</span>
                            {ev.genre && <span className="tag tag-genre">{ev.genre}</span>}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="detail-sidebar">
              <div className="detail-box">
                <h3>ℹ️ Quick Info</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <span>📍 {venue.city}{venue.country ? `, ${venue.country}` : ''}</span>
                  {venue.capacity && <span>👥 Capacity: {venue.capacity.toLocaleString()}</span>}
                  {venue.address && <span>🗺️ {venue.address}</span>}
                </div>
              </div>

              {venue.city && (
                <div className="detail-box">
                  <h3>🏨 Nearby Stays</h3>
                  <p className="text-muted mb-2">
                    Find accommodations in {venue.city}
                  </p>
                  <Link
                    to={`/accommodations?city=${encodeURIComponent(venue.city)}`}
                    className="btn btn-secondary btn-block"
                  >
                    Browse Stays →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
