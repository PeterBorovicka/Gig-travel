import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HeroSection() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/events?search=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <section className="hero">
      <div className="hero-content">
        <h1>
          Discover <span className="highlight">Live Events</span> &amp; Travel
          the World 🌍
        </h1>
        <p>
          Find concerts, festivals, and shows worldwide. Book tickets and
          accommodations — all in one place.
        </p>
        <form className="hero-search" onSubmit={handleSearch}>
          <input
            type="text"
            className="form-input"
            placeholder="Search events, artists, cities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-accent">
            🔍 Search
          </button>
        </form>
      </div>
    </section>
  );
}
