import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { iconForType } from '../constants/attractionIcons';

function DestinationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [destination, setDestination] = useState(null);
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    Promise.all([
      fetch(`http://127.0.0.1:8000/api/destinations/${id}`).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
        return r.json();
      }),
      fetch(`http://127.0.0.1:8000/api/destinations/${id}/attractions`).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
        return r.json();
      }),
    ])
      .then(([dest, attrs]) => {
        setDestination(dest);
        setAttractions(attrs);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  return (
    <div className="app-shell">
      <div className="page-container">

        <button
          type="button"
          className="back-link"
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
        >
          ← Back
        </button>

        {loading && <p className="info-chip">⟳ Loading destination…</p>}
        {error && <p className="error-message">✕ {error}</p>}

        {!loading && !error && destination && (
          <div className="grid-layout">
            <main className="stack">
              <section className="detail-card">
                {destination.image_url && (
                  <div className="detail-media">
                    <img
                      src={destination.image_url}
                      alt={destination.name}
                      onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
                    />
                  </div>
                )}
                <div className="detail-hero">
                  <div className="detail-copy">
                    <span className="eyebrow">✦ {destination.country}</span>
                    <h1 className="page-title" style={{ marginTop: '16px' }}>
                      {destination.name}
                    </h1>
                    <p>{destination.description}</p>
                  </div>
                  <span className="badge">{destination.country}</span>
                </div>

              

                <hr className="card-divider" />

                <div className="quick-stats">
                  <div className="quick-stat">
                    <span>Country</span>
                    <strong>{destination.country}</strong>
                  </div>
                  <div className="quick-stat">
                    <span>Trip type</span>
                    <strong>{destination.trip_type}</strong>
                  </div>
                  <div className="quick-stat">
                    <span>Best season</span>
                    <strong>{destination.season}</strong>
                  </div>
                  <div className="quick-stat">
                    <span>Budget level</span>
                    <strong>{destination.budget_level}</strong>
                  </div>
                  <div className="quick-stat">
                    <span>Duration</span>
                    <strong>{destination.duration_range}</strong>
                  </div>
                </div>
              </section>

              {attractions.length > 0 && (
                <section className="detail-card">
                  <div className="detail-copy" style={{ marginBottom: 20 }}>
                    <span className="eyebrow">✦ Things to do here</span>
                    <h2 className="card-heading" style={{ marginTop: 12, fontSize: '1.35rem' }}>
                      {attractions.length} attraction{attractions.length !== 1 ? 's' : ''} in {destination.name}
                    </h2>
                  </div>

                  <ul className="attraction-list">
                    {attractions.map((attraction) => (
                      <li key={attraction.id} className="attraction-item">
                        <div className="attraction-icon" aria-hidden="true">
                          {iconForType(attraction.type)}
                        </div>
                        <div className="attraction-body">
                          <div className="attraction-head">
                            <strong>{attraction.name}</strong>
                            {attraction.type && (
                              <span className="tag">{attraction.type}</span>
                            )}
                          </div>
                          {attraction.description && (
                            <p className="attraction-description">{attraction.description}</p>
                          )}
                        </div>
                        {attraction.price_estimate !== null && attraction.price_estimate !== undefined && (
                          <div className="attraction-price">
                            {Number(attraction.price_estimate) === 0 ? (
                              <strong>Free</strong>
                            ) : (
                              <>
                                <span>From</span>
                                <strong>€{Number(attraction.price_estimate).toFixed(0)}</strong>
                              </>
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </main>

            <aside className="stack">
              <section className="info-card">
                <h3>Plan this trip</h3>
                <div className="info-list">
                  <div className="info-list-item">
                    <div className="hero-point-icon">✈</div>
                    <div>
                      <strong>Ready to go?</strong>
                      <p>Create a plan and start adding activities day by day.</p>
                    </div>
                  </div>
                  <div className="info-list-item">
                    <div className="hero-point-icon">◈</div>
                    <div>
                      <strong>Budget: {destination.budget_level}</strong>
                      <p>Plan your expenses around a {destination.budget_level}-budget trip.</p>
                    </div>
                  </div>
                  <div className="info-list-item">
                    <div className="hero-point-icon">◷</div>
                    <div>
                      <strong>Duration: {destination.duration_range}</strong>
                      <p>Suggested trip length for this destination.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="info-card">
                <h3>Actions</h3>
                <div className="button-row">
                  {token ? (
                    <Link to={`/trip-plans/create?destination_id=${destination.id}`} className="btn">
                      Create plan →
                    </Link>
                  ) : (
                    <Link to={`/login?redirect=/trip-plans/create&destination_id=${destination.id}`} className="btn">
                      Login to create plan →
                    </Link>
                  )}
                  <Link to="/questionnaire" className="btn-secondary">Get recommendations</Link>
                  <Link to="/" className="btn-ghost">All destinations</Link>
                </div>
              </section>
            </aside>
          </div>
        )}

        {!loading && !error && !destination && (
          <div className="empty-state">
            <span className="empty-state-icon">🗺️</span>
            Destination not found.
          </div>
        )}

      </div>
    </div>
  );
}

export default DestinationDetails;