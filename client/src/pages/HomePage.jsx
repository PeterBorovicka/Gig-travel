import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import { getEvents, getVenues, getAccommodations } from '../api';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function Stars({ rating }) {
  const full = Math.floor(rating || 0);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  return (
    <span className="stars">
      {'★'.repeat(full)}
      {half ? '½' : ''}
      {'☆'.repeat(5 - full - half)}
    </span>
  );
}

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [ev, ve, ac] = await Promise.all([
          getEvents(),
          getVenues(),
          getAccommodations(),
        ]);
        setEvents(Array.isArray(ev) ? ev.slice(0, 6) : []);
        setVenues(Array.isArray(ve) ? ve.slice(0, 6) : []);
        setAccommodations(Array.isArray(ac) ? ac.slice(0, 6) : []);
      } catch {
        /* non-critical — sections will be empty */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      <HeroSection />

      {/* Featured Events */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">🎫 Featured Events</h2>
          <p className="section-subtitle">
            The hottest concerts & festivals happening soon
          </p>

          {loading ? (
            <div className="loading"><div className="spinner" /><span>Loading events…</span></div>
          ) : events.length === 0 ? (
            <div className="empty-state"><div className="emoji">🎵</div><p>No events yet — check back soon!</p></div>
          ) : (
            <div className="grid grid-3">
              {events.map((ev) => (
                <Link to={`/events/${ev.id}`} key={ev.id} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="card-image">🎶</div>
                  <div className="card-body">
                    <h3 className="card-title">{ev.title}</h3>
                    <p className="card-text">{ev.artist || ev.description?.slice(0, 60)}</p>
                    <div className="card-meta">
                      <span>📅 {formatDate(ev.date)}</span>
                      {ev.city && <span>📍 {ev.city}</span>}
                      {ev.genre && <span className="tag tag-genre">{ev.genre}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-3">
            <Link to="/events" className="btn btn-secondary">View All Events →</Link>
          </div>
        </div>
      </section>

      {/* Featured Venues */}
      <section className="section" style={{ background: 'var(--bg-card)' }}>
        <div className="container">
          <h2 className="section-title">🎤 Popular Venues</h2>
          <p className="section-subtitle">Iconic stages around the world</p>

          {loading ? (
            <div className="loading"><div className="spinner" /></div>
          ) : venues.length === 0 ? (
            <div className="empty-state"><div className="emoji">🏟️</div><p>No venues yet</p></div>
          ) : (
            <div className="grid grid-3">
              {venues.map((v) => (
                <Link to={`/venues/${v.id}`} key={v.id} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="card-image">🏟️</div>
                  <div className="card-body">
                    <h3 className="card-title">{v.name}</h3>
                    <div className="card-meta">
                      <span>📍 {v.city}{v.country ? `, ${v.country}` : ''}</span>
                      {v.capacity && <span>👥 {v.capacity.toLocaleString()}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-3">
            <Link to="/venues" className="btn btn-secondary">View All Venues →</Link>
          </div>
        </div>
      </section>

      {/* Featured Accommodations */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">🏨 Where to Stay</h2>
          <p className="section-subtitle">
            Hand-picked accommodations near the best venues
          </p>

          {loading ? (
            <div className="loading"><div className="spinner" /></div>
          ) : accommodations.length === 0 ? (
            <div className="empty-state"><div className="emoji">🏨</div><p>No accommodations yet</p></div>
          ) : (
            <div className="grid grid-3">
              {accommodations.map((a) => (
                <Link to={`/accommodations/${a.id}`} key={a.id} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="card-image">🏨</div>
                  <div className="card-body">
                    <h3 className="card-title">{a.name}</h3>
                    <div className="card-meta">
                      <span>📍 {a.city}{a.country ? `, ${a.country}` : ''}</span>
                      {a.rating && <Stars rating={a.rating} />}
                    </div>
                    {a.price_per_night && (
                      <div className="card-price mt-1">
                        €{Number(a.price_per_night).toFixed(2)}/night
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-3">
            <Link to="/accommodations" className="btn btn-secondary">
              View All Accommodations →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <div className="cta-section">
            <h2>🗺️ Ready for Your Next Adventure?</h2>
            <p>
              Browse events, book tickets, and find the perfect place to stay —
              all with secure Stripe payments.
            </p>
            <Link to="/events" className="btn btn-lg">
              Explore Events 🎵
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
