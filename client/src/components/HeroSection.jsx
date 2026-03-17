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
          Pick a Show. <span className="highlight">Book Everything.</span>
        </h1>
        <p>
          Tickets, hotel, and travel — sorted in one click so you never miss
          a gig.
        </p>
        <form className="hero-search" onSubmit={handleSearch}>
          <input
            type="text"
            className="form-input"
            placeholder="Search artists, shows, or cities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-accent">
            🔍 Find Shows
          </button>
        </form>
      </div>
    </section>
  );
}
