import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function CreateTripPlan() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    destination_id: new URLSearchParams(window.location.search).get('destination_id') || '',
    title: '',
    start_date: '',
    end_date: '',
    budget_limit: '',
  });

  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }

    fetch('http://127.0.0.1:8000/api/destinations')
  .then(r => r.json())
  .then(data => setDestinations(data.data));
  }, []);

 const handleSubmit = async () => {
    setError('');

    if (!form.title) { setError('Please enter a title'); return; }
    if (!form.destination_id) { setError('Please select a destination'); return; }
    if (!form.start_date) { setError('Please select a start date'); return; }
    if (!form.end_date) { setError('Please select an end date'); return; }
    if (form.end_date < form.start_date) { setError('End date must be after start date'); return; }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/trip-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          budget_limit: form.budget_limit || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create plan');

      navigate(`/trip-plans/${data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="page-container">
        <Link to="/trip-plans" className="back-link">← Back to my plans</Link>

        <div className="auth-layout" style={{ maxWidth: 640, margin: '0 auto' }}>
          <div className="hero-panel">
            <span className="eyebrow">✦ New adventure</span>
            <h1 className="hero-title">Create a Trip Plan</h1>
            <p className="hero-text">Choose a destination, pick your dates and start planning!</p>
          </div>

          <div className="content-card">
            {error && <p className="error-message">✕ {error}</p>}

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  className="form-input"
                  placeholder="e.g. Summer in Paris"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Destination</label>
                <select
                  className="form-select"
                  value={form.destination_id}
                  onChange={e => setForm({ ...form, destination_id: e.target.value })}
                >
                  <option value="">Select a destination...</option>
                  {destinations.map(d => (
                    <option key={d.id} value={d.id}>{d.name}, {d.country}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Start date</label>
                <input
                  className="form-input"
                  type="date"
                  value={form.start_date}
                  onChange={e => setForm({ ...form, start_date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">End date</label>
                <input
                  className="form-input"
                  type="date"
                  value={form.end_date}
                  onChange={e => setForm({ ...form, end_date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Budget limit (€) — optional</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="e.g. 1500"
                  value={form.budget_limit}
                  onChange={e => setForm({ ...form, budget_limit: e.target.value })}
                />
              </div>

              <div className="button-row">
                <button className="btn" onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Creating…' : 'Create plan →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateTripPlan;