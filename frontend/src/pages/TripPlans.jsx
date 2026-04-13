import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function TripPlans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
            <Link to="/" className="btn-ghost">Browse destinations</Link>
          </div>
        </header>

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
          {plans.map(plan => (
            <article key={plan.id} className="destination-card">
              <div className="card-top">
                <div>
                  <h2 className="card-heading">{plan.title}</h2>
                  <p className="card-description">
                    {plan.destination?.name}, {plan.destination?.country}
                  </p>
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
                {plan.budget_limit && (
                  <div className="detail-pill">
                    <span>Budget</span>
                    <strong>€{plan.budget_limit}</strong>
                  </div>
                )}
              </div>

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
          ))}
        </div>

      </div>
    </div>
  );
}

export default TripPlans;