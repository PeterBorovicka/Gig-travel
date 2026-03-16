import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getVenues } from '../api';

export default function VenuesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [country, setCountry] = useState(searchParams.get('country') || '');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (searchParams.get('search')) params.search = searchParams.get('search');
        if (searchParams.get('city')) params.city = searchParams.get('city');
        if (searchParams.get('country')) params.country = searchParams.get('country');
        const data = await getVenues(params);
        setVenues(Array.isArray(data) ? data : []);
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
    if (city.trim()) params.city = city.trim();
    if (country.trim()) params.country = country.trim();
    setSearchParams(params);
  }

  return (
    <>
      <div className="detail-header">
        <div className="container">
          <h1>🎤 Venues</h1>
          <p className="text-muted">Discover iconic stages and concert halls worldwide</p>
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
                placeholder="Venue name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
            <div className="form-group">
              <label className="form-label">Country</label>
              <input
                type="text"
                className="form-input"
                placeholder="UK, Germany…"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">🔍 Filter</button>
          </form>

          {loading ? (
            <div className="loading"><div className="spinner" /><span>Loading venues…</span></div>
          ) : error ? (
            <div className="error-message"><h3>⚠️ Error</h3><p>{error}</p></div>
          ) : venues.length === 0 ? (
            <div className="empty-state">
              <div className="emoji">🏟️</div>
              <h3>No venues found</h3>
              <p>Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-3">
              {venues.map((v) => (
                <Link
                  to={`/venues/${v.id}`}
                  key={v.id}
                  className="card"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="card-image">🏟️</div>
                  <div className="card-body">
                    <h3 className="card-title">{v.name}</h3>
                    <div className="card-meta">
                      <span>📍 {v.city}{v.country ? `, ${v.country}` : ''}</span>
                      {v.capacity && <span>👥 {v.capacity.toLocaleString()}</span>}
                    </div>
                    {v.description && (
                      <p className="card-text mt-1">
                        {v.description.length > 80 ? v.description.slice(0, 80) + '…' : v.description}
                      </p>
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
