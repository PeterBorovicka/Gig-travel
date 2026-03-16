import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAccommodations } from '../api';

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

export default function AccommodationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (searchParams.get('search')) params.search = searchParams.get('search');
        if (searchParams.get('city')) params.city = searchParams.get('city');
        if (searchParams.get('min_price')) params.min_price = searchParams.get('min_price');
        if (searchParams.get('max_price')) params.max_price = searchParams.get('max_price');
        const data = await getAccommodations(params);
        setAccommodations(Array.isArray(data) ? data : []);
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
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;
    setSearchParams(params);
  }

  return (
    <>
      <div className="detail-header">
        <div className="container">
          <h1>🏨 Accommodations</h1>
          <p className="text-muted">Find your perfect stay near the best venues</p>
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
                placeholder="Hotel name…"
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
              <label className="form-label">Min Price (€)</label>
              <input
                type="number"
                className="form-input"
                placeholder="0"
                min="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Max Price (€)</label>
              <input
                type="number"
                className="form-input"
                placeholder="500"
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">🔍 Filter</button>
          </form>

          {loading ? (
            <div className="loading"><div className="spinner" /><span>Loading accommodations…</span></div>
          ) : error ? (
            <div className="error-message"><h3>⚠️ Error</h3><p>{error}</p></div>
          ) : accommodations.length === 0 ? (
            <div className="empty-state">
              <div className="emoji">🏨</div>
              <h3>No accommodations found</h3>
              <p>Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-3">
              {accommodations.map((a) => (
                <Link
                  to={`/accommodations/${a.id}`}
                  key={a.id}
                  className="card"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="card-image">🏨</div>
                  <div className="card-body">
                    <h3 className="card-title">{a.name}</h3>
                    <div className="card-meta">
                      <span>📍 {a.city}{a.country ? `, ${a.country}` : ''}</span>
                      {a.rating && <Stars rating={a.rating} />}
                    </div>
                    {a.amenities && (
                      <div className="amenities mt-1">
                        {(typeof a.amenities === 'string' ? a.amenities.split(',') : a.amenities)
                          .slice(0, 3)
                          .map((am, i) => (
                            <span key={i} className="amenity-tag">{am.trim()}</span>
                          ))}
                      </div>
                    )}
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
        </div>
      </section>
    </>
  );
}
