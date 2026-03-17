import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo" onClick={() => setOpen(false)}>
          🎵 <span>Gig Travel</span>
        </Link>

        <button
          className="navbar-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? '✕' : '☰'}
        </button>

        <div className={`navbar-links${open ? ' open' : ''}`}>
          <NavLink to="/events" onClick={() => setOpen(false)}>🎫 Events</NavLink>
          <NavLink to="/venues" onClick={() => setOpen(false)}>🎤 Venues</NavLink>
          <NavLink to="/accommodations" onClick={() => setOpen(false)}>🏨 Stays</NavLink>
          <NavLink to="/assistant" onClick={() => setOpen(false)}>🤖 AI Assistant</NavLink>
          <NavLink to="/bookings" onClick={() => setOpen(false)}>📋 Bookings</NavLink>
        </div>
      </div>
    </nav>
  );
}
