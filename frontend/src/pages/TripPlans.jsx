import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function TripPlans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const canCompare = selectedIds.length >= 2 && selectedIds.length <= 3;
  const goCompare = () => {
    if (!canCompare) return;
    navigate(`/trip-plans/compare?ids=${selectedIds.join(',')}`);
  };

  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user'))
    : null;

  useEffect(() => {
    if (!token) { navigate('/login'); return; }

    fetch('http://127.0.0.1:8000/api/trip-plans', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setPlans(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this plan?')) return;

    await fetch(`http://127.0.0.1:8000/api/trip-plans/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    setPlans(plans.filter(p => p.id !== id));
  };

  return (
    <div className="app-shell">
      <div className="page-container">

        <header className="page-header">
          <div>
            <span className="eyebrow">✦ My adventures</span>
            <h1 className="page-title">My Trip Plans</h1>
            <p className="page-subtitle">Manage and view all your travel plans.</p>
          </div>
          <div className="top-actions">
            <Link to="/trip-plans/create" className="btn">+ New plan</Link>
            <Link to="/feedback" className="btn-secondary">💬 Feedback</Link>
            <Link to="/" className="btn-ghost">Browse destinations</Link>
          </div>
        </header>

        {selectedIds.length > 0 && (
          <section className="profile-bar" style={{ marginBottom: 16, background: 'var(--accent-light)' }}>
            <div className="profile-meta">
              <small>Selected for comparison</small>
              <strong>{selectedIds.length} plan(s) — pick 2 or 3 to compare</strong>
            </div>
            <div className="profile-actions">
              <button
                className="btn"
                onClick={goCompare}
                disabled={!canCompare}
                style={!canCompare ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
              >
                Compare →
              </button>
              <button className="btn-ghost" onClick={() => setSelectedIds([])}>Clear</button>
            </div>
          </section>
        )}

        {user && (
          <section className="profile-bar">
            <div className="profile-meta">
              <small>Logged in as</small>
              <strong>{user.name} — {user.email}</strong>
            </div>
          </section>
        )}

        {error && <p className="error-message">✕ {error}</p>}
        {loading && <p className="info-chip">⟳ Loading plans…</p>}

        {!loading && plans.length === 0 && (
          <div className="empty-state">
            <span className="empty-state-icon">🗺️</span>
            <p>No plans yet. <Link to="/trip-plans/create">Create your first plan!</Link></p>
          </div>
        )}

        <div className="destination-grid">
          {plans.map(plan => {
            const activitiesCost = (plan.trip_days || []).reduce(
              (sum, day) => sum + (day.activities || []).reduce((s, a) => s + Number(a.cost || 0), 0),
              0
            );
            const spent = Number(plan.flight_cost || 0) + Number(plan.hotel_cost || 0) + activitiesCost;
            const limit = plan.budget_limit != null ? Number(plan.budget_limit) : null;
            const pct = limit && limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
            const over = limit != null && spent > limit;

            const isSelected = selectedIds.includes(plan.id);
            return (
            <article
              key={plan.id}
              className="destination-card"
              style={isSelected ? { borderColor: 'var(--primary)', boxShadow: '0 0 0 2px var(--primary-light)' } : undefined}
            >
              <div className="card-top">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(plan.id)}
                    title="Select for comparison"
                    style={{ marginTop: 6, cursor: 'pointer', width: 18, height: 18 }}
                  />
                  <div>
                    <h2 className="card-heading">{plan.title}</h2>
                    <p className="card-description">
                      {plan.destination?.name}, {plan.destination?.country}
                    </p>
                  </div>
                </div>
                <span className="badge">{plan.status}</span>
              </div>

              <div className="details-grid">
                <div className="detail-pill">
                  <span>Start date</span>
                  <strong>{plan.start_date}</strong>
                </div>
                <div className="detail-pill">
                  <span>End date</span>
                  <strong>{plan.end_date}</strong>
                </div>
                <div className="detail-pill">
                  <span>Days</span>
                  <strong>{plan.trip_days?.length ?? 0}</strong>
                </div>
                {limit != null && (
                  <div className="detail-pill">
                    <span>Budget</span>
                    <strong>€{limit.toFixed(2)}</strong>
                  </div>
                )}
                <div className="detail-pill">
                  <span>Spent</span>
                  <strong style={{ color: over ? '#c0392b' : undefined }}>€{spent.toFixed(2)}</strong>
                </div>
              </div>

              {limit != null && limit > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{
                    width: '100%',
                    height: 8,
                    background: 'rgba(0,0,0,0.08)',
                    borderRadius: 999,
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: over ? '#c0392b' : pct > 85 ? '#e67e22' : '#27ae60',
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                  <small style={{ color: 'var(--text-soft)', display: 'block', marginTop: 4 }}>
                    {over ? `Over by €${(spent - limit).toFixed(2)}` : `€${(limit - spent).toFixed(2)} remaining`}
                  </small>
                </div>
              )}

              <hr className="card-divider" />

              <div className="button-row">
                <button className="btn" onClick={() => navigate(`/trip-plans/${plan.id}`)}>
                  View plan →
                </button>
                <button className="btn-ghost" onClick={() => handleDelete(plan.id)}>
                  Delete
                </button>
              </div>
            </article>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default TripPlans;