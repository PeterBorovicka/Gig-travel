import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEvent, getAccommodations, bookTicket } from '../api';

const CURRENCY_SYMBOLS = { EUR: '€', USD: '$', GBP: '£', CAD: 'C$' };

function fmtPrice(amount, currency) {
  const sym = CURRENCY_SYMBOLS[currency] || currency + ' ';
  return `${sym}${Number(amount).toFixed(2)}`;
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(t) {
  if (!t) return '';
  return t.slice(0, 5);
}

export default function EventDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [email, setEmail] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [bookingError, setBookingError] = useState(null);
  const [nearbyStays, setNearbyStays] = useState([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getEvent(id);
        setEvent(data);
        setTickets(Array.isArray(data.tickets) ? data.tickets : []);
        if (data.city) {
          try {
            const stays = await getAccommodations({ city: data.city });
            setNearbyStays(Array.isArray(stays) ? stays.slice(0, 3) : []);
          } catch {
            /* non-critical */
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleBuy(e) {
    e.preventDefault();
    if (!selectedTicket) return;
    setBooking(true);
    setBookingError(null);
    setBookingResult(null);
    try {
      const result = await bookTicket({
        ticket_id: selectedTicket.id,
        quantity,
        user_email: email,
      });
      setBookingResult(result);
    } catch (err) {
      setBookingError(err.message);
    } finally {
      setBooking(false);
    }
  }

  if (loading) {
    return <div className="loading"><div className="spinner" /><span>Loading event…</span></div>;
  }

  if (error) {
    return (
      <div className="error-message">
        <h3>⚠️ Error</h3>
        <p>{error}</p>
        <Link to="/events" className="btn btn-secondary mt-2">← Back to Events</Link>
      </div>
    );
  }

  if (!event) return null;

  return (
    <>
      <div className="detail-header">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="separator">/</span>
            <Link to="/events">Events</Link>
            <span className="separator">/</span>
            <span>{event.title}</span>
          </div>
          <h1>{event.title}</h1>
          {event.artist && <p style={{ fontSize: '1.15rem', color: 'var(--primary-light)' }}>🎤 {event.artist}</p>}
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="detail-grid">
            {/* Main content */}
            <div>
              <div className="detail-box mb-3">
                <h3>📋 Event Details</h3>
                {event.description && <p className="text-muted mb-2">{event.description}</p>}
                <div className="card-meta" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span>📅 {formatDate(event.date)}</span>
                  {event.time && <span>🕐 {formatTime(event.time)}</span>}
                  {event.genre && <span>🎵 Genre: <span className="tag tag-genre">{event.genre}</span></span>}
                  {event.city && <span>📍 {event.city}{event.country ? `, ${event.country}` : ''}</span>}
                  {event.venue_name && <span>🏟️ {event.venue_name}</span>}
                </div>
              </div>

              {/* Tickets table */}
              {tickets.length > 0 && (
                <div className="detail-box">
                  <h3>🎫 Available Tickets</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="ticket-table">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Price</th>
                          <th>Available</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {tickets.map((t) => (
                          <tr key={t.id}>
                            <td><strong>{t.ticket_type || t.type || 'Standard'}</strong></td>
                            <td className="card-price">{fmtPrice(t.price, t.currency)}</td>
                            <td>{t.available ?? t.quantity_available ?? '—'}</td>
                            <td>
                              <button
                                className={`btn btn-sm ${selectedTicket?.id === t.id ? 'btn-accent' : 'btn-primary'}`}
                                onClick={() => setSelectedTicket(t)}
                              >
                                {selectedTicket?.id === t.id ? '✓ Selected' : 'Select'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="detail-sidebar">
              <div className="detail-box">
                <h3>🛒 Buy Tickets</h3>

                {bookingResult && (
                  <div className="alert alert-success">
                    ✅ Booking confirmed! Check your email for details.
                  </div>
                )}
                {bookingError && (
                  <div className="alert alert-error">⚠️ {bookingError}</div>
                )}

                {tickets.length === 0 ? (
                  <p className="text-muted">No tickets available at this time.</p>
                ) : (
                  <form onSubmit={handleBuy}>
                    <div className="form-group">
                      <label className="form-label">Selected Ticket</label>
                      <div style={{ padding: '0.5rem 0', color: selectedTicket ? 'var(--accent)' : 'var(--text-dim)' }}>
                        {selectedTicket
                          ? `${selectedTicket.ticket_type || selectedTicket.type || 'Standard'} — ${fmtPrice(selectedTicket.price, selectedTicket.currency)}`
                          : 'Select a ticket from the table'}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Quantity</label>
                      <select
                        className="form-select"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="you@email.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    {selectedTicket && (
                      <div style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
                        <strong>Total: {fmtPrice(selectedTicket.price * quantity, selectedTicket.currency)}</strong>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="btn btn-accent btn-block"
                      disabled={!selectedTicket || !email || booking}
                    >
                      {booking ? 'Processing…' : '🎫 Buy Tickets'}
                    </button>
                  </form>
                )}

                <div className="stripe-badge">🔒 Powered by Stripe</div>
                <div className="payment-icons">
                  <span className="payment-icon">💳 Visa</span>
                  <span className="payment-icon">💳 Mastercard</span>
                  <span className="payment-icon"> Apple Pay</span>
                  <span className="payment-icon">🅖 Google Pay</span>
                </div>
              </div>

              {event.city && (
                <div className="detail-box">
                  <h3>🏨 Complete Your Trip</h3>
                  <p className="text-muted mb-2">
                    Places to stay in {event.city}
                  </p>
                  {nearbyStays.length > 0 ? (
                    <div className="trip-stays-list">
                      {nearbyStays.map((s) => (
                        <Link
                          key={s.id}
                          to={`/accommodations/${s.id}`}
                          className="trip-stay-card"
                        >
                          <div className="trip-stay-info">
                            <strong>{s.name}</strong>
                            {s.rating && (
                              <span className="stars">
                                {'★'.repeat(Math.floor(s.rating))}
                                {'☆'.repeat(5 - Math.floor(s.rating))}
                              </span>
                            )}
                          </div>
                          <div className="trip-stay-price">
                            {fmtPrice(s.price_per_night, s.currency)}/night
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">No stays found nearby.</p>
                  )}
                  <Link
                    to={`/accommodations?city=${encodeURIComponent(event.city)}`}
                    className="btn btn-secondary btn-block mt-2"
                  >
                    View All Stays in {event.city} →
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
