import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getEvents } from '../api';

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [genre, setGenre] = useState(searchParams.get('genre') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (searchParams.get('search')) params.search = searchParams.get('search');
        if (searchParams.get('genre')) params.genre = searchParams.get('genre');
        if (searchParams.get('city')) params.city = searchParams.get('city');
        if (searchParams.get('date')) params.date = searchParams.get('date');
        const data = await getEvents(params);
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [searchParams]);

  function handleFilter(e) {
    e.preventDefault();
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (genre.trim()) params.genre = genre.trim();
    if (city.trim()) params.city = city.trim();
    setSearchParams(params);
  }

  return (
    <>
      <div className="detail-header">
        <div className="container">
          <h1>🎫 Events</h1>
          <p className="text-muted">Find concerts, festivals, and shows worldwide</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <form className="filter-bar" onSubmit={handleFilter}>
            <div className="form-group">
              <label className="form-label">Search</label>
              <input
                type="text"
                className="form-input"
                placeholder="Artist, event name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Genre</label>
              <input
                type="text"
                className="form-input"
                placeholder="Rock, Jazz, Pop…"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-input"
                placeholder="London, Berlin…"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">🔍 Filter</button>
          </form>

          {loading ? (
            <div className="loading"><div className="spinner" /><span>Loading events…</span></div>
          ) : error ? (
            <div className="error-message"><h3>⚠️ Error</h3><p>{error}</p></div>
          ) : events.length === 0 ? (
            <div className="empty-state">
              <div className="emoji">🎵</div>
              <h3>No events found</h3>
              <p>Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-3">
              {events.map((ev) => (
                <Link
                  to={`/events/${ev.id}`}
                  key={ev.id}
                  className="card"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="card-image">🎶</div>
                  <div className="card-body">
                    <h3 className="card-title">{ev.title}</h3>
                    <p className="card-text">{ev.artist || ''}</p>
                    <div className="card-meta">
                      <span>📅 {formatDate(ev.date)}</span>
                      {ev.city && <span>📍 {ev.city}</span>}
                    </div>
                    {ev.genre && (
                      <span className="tag tag-genre mt-1">{ev.genre}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
