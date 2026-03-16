import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAccommodation, bookAccommodation } from '../api';

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

function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut) - new Date(checkIn);
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function AccommodationDetailPage() {
  const { id } = useParams();
  const [accommodation, setAccommodation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [email, setEmail] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getAccommodation(id);
        setAccommodation(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const nights = nightsBetween(checkIn, checkOut);
  const pricePerNight = accommodation ? Number(accommodation.price_per_night || 0) : 0;
  const totalPrice = nights * pricePerNight;

  async function handleBook(e) {
    e.preventDefault();
    setBooking(true);
    setBookingError(null);
    setBookingResult(null);
    try {
      const result = await bookAccommodation({
        accommodation_id: id,
        check_in: checkIn,
        check_out: checkOut,
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
    return <div className="loading"><div className="spinner" /><span>Loading accommodation…</span></div>;
  }

  if (error) {
    return (
      <div className="error-message">
        <h3>⚠️ Error</h3>
        <p>{error}</p>
        <Link to="/accommodations" className="btn btn-secondary mt-2">← Back</Link>
      </div>
    );
  }

  if (!accommodation) return null;

  const amenities = accommodation.amenities
    ? typeof accommodation.amenities === 'string'
      ? accommodation.amenities.split(',')
      : accommodation.amenities
    : [];

  return (
    <>
      <div className="detail-header">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="separator">/</span>
            <Link to="/accommodations">Accommodations</Link>
            <span className="separator">/</span>
            <span>{accommodation.name}</span>
          </div>
          <h1>🏨 {accommodation.name}</h1>
          <p className="text-muted">
            📍 {accommodation.city}
            {accommodation.country ? `, ${accommodation.country}` : ''}
            {accommodation.rating ? <> · <Stars rating={accommodation.rating} /></> : ''}
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="detail-grid">
            <div>
              <div className="detail-box mb-3">
                <h3>📋 About</h3>
                {accommodation.description && (
                  <p className="text-muted mb-2">{accommodation.description}</p>
                )}
                <div className="card-meta" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span>📍 {accommodation.city}{accommodation.country ? `, ${accommodation.country}` : ''}</span>
                  {accommodation.address && <span>🗺️ {accommodation.address}</span>}
                  {accommodation.rating && (
                    <span>⭐ Rating: <Stars rating={accommodation.rating} /> ({accommodation.rating})</span>
                  )}
                </div>
              </div>

              {amenities.length > 0 && (
                <div className="detail-box mb-3">
                  <h3>✨ Amenities</h3>
                  <div className="amenities">
                    {amenities.map((am, i) => (
                      <span key={i} className="amenity-tag">{am.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="detail-box">
                <h3>💰 Pricing</h3>
                <div className="card-price" style={{ fontSize: '1.5rem' }}>
                  €{pricePerNight.toFixed(2)}<span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}> / night</span>
                </div>
              </div>
            </div>

            <div className="detail-sidebar">
              <div className="detail-box">
                <h3>📅 Book This Stay</h3>

                {bookingResult && (
                  <div className="alert alert-success">
                    ✅ Booking confirmed! Check your email for details.
                  </div>
                )}
                {bookingError && (
                  <div className="alert alert-error">⚠️ {bookingError}</div>
                )}

                <form onSubmit={handleBook}>
                  <div className="form-group">
                    <label className="form-label">Check-in</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Check-out</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                    />
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

                  {nights > 0 && (
                    <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <span>€{pricePerNight.toFixed(2)} × {nights} night{nights !== 1 ? 's' : ''}</span>
                        <span>€{totalPrice.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontWeight: 700, fontSize: '1.1rem' }}>
                        <span>Total</span>
                        <span className="card-price">€{totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-accent btn-block"
                    disabled={!checkIn || !checkOut || !email || nights <= 0 || booking}
                  >
                    {booking ? 'Processing…' : '🏨 Book Now'}
                  </button>
                </form>

                <div className="stripe-badge">🔒 Powered by Stripe</div>
                <div className="payment-icons">
                  <span className="payment-icon">💳 Visa</span>
                  <span className="payment-icon">💳 Mastercard</span>
                  <span className="payment-icon"> Apple Pay</span>
                  <span className="payment-icon">🅖 Google Pay</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
