import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import { getEvents, getAccommodations } from '../api';

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
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [ev, ac] = await Promise.all([
          getEvents(),
          getAccommodations(),
        ]);
        setEvents(Array.isArray(ev) ? ev.slice(0, 6) : []);
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
          <h2 className="section-title">🎫 Upcoming Shows</h2>
          <p className="section-subtitle">
            Pick a show — we'll help you sort tickets and a place to stay
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
                    <span className="card-cta">Tickets + Hotel →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-3">
            <Link to="/events" className="btn btn-secondary">View All Shows →</Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section" style={{ background: 'var(--bg-card)' }}>
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">From lineup announcement to check-in — three steps</p>
          <div className="grid grid-3">
            <div className="detail-box text-center">
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🎵</div>
              <h3>1. Find Your Show</h3>
              <p className="text-muted">Search by artist, genre, or city to find the gig you want.</p>
            </div>
            <div className="detail-box text-center">
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🎫</div>
              <h3>2. Grab Tickets</h3>
              <p className="text-muted">Choose General Admission, VIP, or Premium — right on the event page.</p>
            </div>
            <div className="detail-box text-center">
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🏨</div>
              <h3>3. Book a Stay</h3>
              <p className="text-muted">Hotels near the venue are listed alongside your tickets — book in one click.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Where to Stay */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">🏨 Where to Stay</h2>
          <p className="section-subtitle">
            Hotels near the best venues — also shown on every event page
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
            <h2>🎵 Ready for Your Next Show?</h2>
            <p>
              Find a show, grab tickets, and book a hotel — all in one click.
            </p>
            <Link to="/events" className="btn btn-lg">
              Browse Shows 🎫
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
