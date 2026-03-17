import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link to="/" className="navbar-logo" style={{ fontSize: '1.2rem' }}>
            🎵 <span>Gig Travel</span>
          </Link>
          <p>
            Pick a show, grab your tickets, and book a hotel — all in one click.
          </p>
        </div>

        <div className="footer-links">
          <h4>Explore</h4>
          <Link to="/events">Events</Link>
          <Link to="/venues">Venues</Link>
          <Link to="/accommodations">Accommodations</Link>
        </div>

        <div className="footer-links">
          <h4>Account</h4>
          <Link to="/bookings">My Bookings</Link>
        </div>

        <div className="footer-links">
          <h4>Payments</h4>
          <div className="payment-methods" style={{ marginTop: '0.25rem' }}>
            <span className="payment-badge">💳 Visa</span>
            <span className="payment-badge">💳 Mastercard</span>
            <span className="payment-badge"> Apple Pay</span>
            <span className="payment-badge">🅖 Google Pay</span>
          </div>
          <div className="stripe-badge" style={{ marginTop: '0.75rem' }}>
            🔒 Powered by Stripe
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Gig Travel. All rights reserved.</span>
        <div className="payment-methods">
          <span className="payment-badge">🔒 Secure checkout</span>
          <span className="payment-badge">🌍 Worldwide events</span>
        </div>
      </div>
    </footer>
  );
}
