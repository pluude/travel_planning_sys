import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

function DestinationDetails() {
  const { id } = useParams();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/destinations/${id}`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
        return response.json();
      })
      .then((data) => {
        setDestination(data);
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

        <Link to="/" className="back-link">← Back to destinations</Link>

        {loading && <p className="info-chip">⟳ Loading destination…</p>}
        {error && <p className="error-message">✕ {error}</p>}

        {!loading && !error && destination && (
          <div className="grid-layout">
            <main className="stack">
              <section className="detail-card">
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

                <div className="tags-row" style={{ marginBottom: '20px' }}>
                  <span className="tag">{destination.trip_type}</span>
                  <span className="tag">{destination.season}</span>
                  <span className="tag">{destination.budget_level}</span>
                  <span className="tag">{destination.duration_range}</span>
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
                    <Link to="/login" className="btn">
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