import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

const INTENSITY_LABEL = {
  light: '🌿 Light',
  medium: '⚖ Medium',
  intense: '🔥 Intense',
};

const INTENSITY_COLOR = {
  light: '#27ae60',
  medium: '#e67e22',
  intense: '#c0392b',
};

function ComparePlans() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ids = searchParams.get('ids') || '';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    if (!ids) { setError('No plans selected for comparison'); setLoading(false); return; }

    fetch(`http://127.0.0.1:8000/api/trip-plans/compare?ids=${ids}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async r => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.message || 'Failed to load comparison');
        return data;
      })
      .then(data => { setResults(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [ids]);

  if (loading) return <div className="app-shell"><p className="info-chip">⟳ Loading comparison…</p></div>;
  if (error) return (
    <div className="app-shell">
      <div className="page-container">
        <Link to="/trip-plans" className="back-link">← Back to my plans</Link>
        <p className="error-message">✕ {error}</p>
      </div>
    </div>
  );

  // Cheapest / most activities / most rest highlights
  const cheapest = results.reduce((min, r) =>
    !min || r.metrics.total_cost < min.metrics.total_cost ? r : min, null);
  const mostActive = results.reduce((max, r) =>
    !max || r.metrics.total_activities > max.metrics.total_activities ? r : max, null);
  const mostRest = results.reduce((max, r) =>
    !max || r.metrics.rest_days > max.metrics.rest_days ? r : max, null);

  // Collect all categories that appear in any plan, for stable column order
  const allCategories = Array.from(new Set(
    results.flatMap(r => Object.keys(r.metrics.category_distribution))
  )).sort();

  return (
    <div className="app-shell">
      <div className="page-container">
        <Link to="/trip-plans" className="back-link">← Back to my plans</Link>

        <header className="page-header">
          <div>
            <span className="eyebrow">✦ Compare</span>
            <h1 className="page-title">Plan comparison</h1>
            <p className="page-subtitle">Side-by-side metrics for the {results.length} selected plans.</p>
          </div>
        </header>

        {/* Highlights */}
        <section className="filter-card" style={{ marginBottom: 24 }}>
          <h3>Highlights</h3>
          <div className="details-grid" style={{ marginTop: 12 }}>
            <div className="detail-pill">
              <span>💶 Cheapest</span>
              <strong>{cheapest?.plan.title} — €{cheapest?.metrics.total_cost.toFixed(2)}</strong>
            </div>
            <div className="detail-pill">
              <span>🎯 Most activities</span>
              <strong>{mostActive?.plan.title} — {mostActive?.metrics.total_activities}</strong>
            </div>
            <div className="detail-pill">
              <span>🛌 Most rest</span>
              <strong>{mostRest?.plan.title} — {mostRest?.metrics.rest_days} day(s)</strong>
            </div>
          </div>
        </section>

        {/* Side-by-side cards */}
        <div className="destination-grid" style={{ gridTemplateColumns: `repeat(${results.length}, minmax(0, 1fr))` }}>
          {results.map(({ plan, metrics }) => {
            const totalActs = metrics.total_activities;
            const intensityColor = INTENSITY_COLOR[metrics.intensity];

            return (
              <article key={plan.id} className="destination-card">
                <div className="card-top">
                  <div>
                    <h2 className="card-heading">{plan.title}</h2>
                    <p className="card-description">
                      {plan.destination?.name}, {plan.destination?.country}
                    </p>
                  </div>
                </div>

                <hr className="card-divider" />

                <div className="details-grid">
                  <div className="detail-pill">
                    <span>Days</span>
                    <strong>{metrics.total_days}</strong>
                  </div>
                  <div className="detail-pill">
                    <span>Activities</span>
                    <strong>{metrics.total_activities}</strong>
                  </div>
                  <div className="detail-pill">
                    <span>Rest days</span>
                    <strong>{metrics.rest_days}</strong>
                  </div>
                  <div className="detail-pill">
                    <span>Avg/day</span>
                    <strong>{metrics.avg_activities_per_day}</strong>
                  </div>
                  <div className="detail-pill">
                    <span>Flight</span>
                    <strong>€{metrics.flight_cost.toFixed(2)}</strong>
                  </div>
                  <div className="detail-pill">
                    <span>Hotel</span>
                    <strong>€{metrics.hotel_cost.toFixed(2)}</strong>
                  </div>
                  <div className="detail-pill">
                    <span>Activities cost</span>
                    <strong>€{metrics.activities_cost.toFixed(2)}</strong>
                  </div>
                  <div className="detail-pill">
                    <span>Total cost</span>
                    <strong>€{metrics.total_cost.toFixed(2)}</strong>
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <p style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 6 }}>
                    Intensity
                  </p>
                  <div style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    borderRadius: 999,
                    background: intensityColor,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}>
                    {INTENSITY_LABEL[metrics.intensity]}
                  </div>
                </div>

                {/* Category bars */}
                {totalActs > 0 && (
                  <div style={{ marginTop: 18 }}>
                    <p style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8 }}>
                      Categories
                    </p>
                    {allCategories.map(cat => {
                      const count = metrics.category_distribution[cat] || 0;
                      const pct = totalActs > 0 ? (count / totalActs) * 100 : 0;
                      return (
                        <div key={cat} style={{ marginBottom: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 3 }}>
                            <span style={{ textTransform: 'capitalize' }}>{cat}</span>
                            <strong>{count}</strong>
                          </div>
                          <div style={{ width: '100%', height: 6, background: 'rgba(0,0,0,0.08)', borderRadius: 999, overflow: 'hidden' }}>
                            <div style={{
                              width: `${pct}%`,
                              height: '100%',
                              background: 'var(--primary)',
                              transition: 'width 0.3s ease',
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="button-row" style={{ marginTop: 16 }}>
                  <Link className="btn-ghost" to={`/trip-plans/${plan.id}`}>Open plan →</Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ComparePlans;
