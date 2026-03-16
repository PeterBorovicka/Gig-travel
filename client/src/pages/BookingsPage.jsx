import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getBookings } from '../api';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function BookingsPage() {
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleLookup(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getBookings(email.trim());
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const allBookings = Array.isArray(bookings) ? bookings : [];
  const ticketBookings = allBookings.filter((b) => b.type === 'ticket');
  const accommodationBookings = allBookings.filter((b) => b.type === 'accommodation');
  const hasBookings = allBookings.length > 0;

  return (
    <>
      <div className="detail-header">
        <div className="container">
          <h1>📋 My Bookings</h1>
          <p className="text-muted">Look up your ticket and accommodation bookings</p>
        </div>
      </div>

      <section className="section">
        <div className="container" style={{ maxWidth: '700px' }}>
          <form className="filter-bar" onSubmit={handleLookup} style={{ marginBottom: '2rem' }}>
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="Enter the email you used to book…"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Searching…' : '🔍 Look Up'}
            </button>
          </form>

          {error && (
            <div className="alert alert-error">⚠️ {error}</div>
          )}

          {bookings && !hasBookings && (
            <div className="empty-state">
              <div className="emoji">📭</div>
              <h3>No bookings found</h3>
              <p>We couldn&apos;t find any bookings for {email}</p>
              <Link to="/events" className="btn btn-primary mt-2">Browse Events</Link>
            </div>
          )}

          {ticketBookings.length > 0 && (
            <div className="mb-3">
              <h2 className="mb-2">🎫 Ticket Bookings</h2>
              <div className="grid" style={{ gap: '1rem' }}>
                {ticketBookings.map((b, i) => (
                  <div key={b.id || i} className="booking-card">
                    <div className="booking-card-header">
                      <div>
                        <strong>🎫 Ticket Booking</strong>
                      </div>
                      <span className={`tag tag-status ${(b.status || 'confirmed').toLowerCase()}`}>
                        {b.status || 'Confirmed'}
                      </span>
                    </div>
                    <div className="booking-card-details">
                      <span>🎫 Qty: {b.quantity || 1}</span>
                      {b.total_price != null && <span>💰 {b.currency === 'USD' ? '$' : b.currency === 'GBP' ? '£' : b.currency === 'CAD' ? 'C$' : '€'}{Number(b.total_price).toFixed(2)}</span>}
                      {b.created_at && <span>🗓️ Booked: {formatDate(b.created_at)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {accommodationBookings.length > 0 && (
            <div>
              <h2 className="mb-2">🏨 Accommodation Bookings</h2>
              <div className="grid" style={{ gap: '1rem' }}>
                {accommodationBookings.map((b, i) => (
                  <div key={b.id || i} className="booking-card">
                    <div className="booking-card-header">
                      <strong>🏨 Accommodation Booking</strong>
                      <span className={`tag tag-status ${(b.status || 'confirmed').toLowerCase()}`}>
                        {b.status || 'Confirmed'}
                      </span>
                    </div>
                    <div className="booking-card-details">
                      <span>📅 {formatDate(b.check_in)} → {formatDate(b.check_out)}</span>
                      {b.total_price != null && <span>💰 {b.currency === 'USD' ? '$' : b.currency === 'GBP' ? '£' : b.currency === 'CAD' ? 'C$' : '€'}{Number(b.total_price).toFixed(2)}</span>}
                      {b.created_at && <span>🗓️ Booked: {formatDate(b.created_at)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
