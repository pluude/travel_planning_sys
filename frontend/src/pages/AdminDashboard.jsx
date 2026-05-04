import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const TRIP_TYPES = ['romantic', 'relaxation', 'adventure', 'sightseeing'];
const SEASONS = ['spring', 'summer', 'autumn', 'winter'];
const BUDGET_LEVELS = ['low', 'medium', 'high'];
const DURATIONS = ['3-5 days', '5-7 days', '1 week'];

const EMPTY_DESTINATION = {
  name: '', country: '', description: '',
  trip_type: 'sightseeing', season: 'spring', budget_level: 'medium',
  duration_range: '3-5 days', image_url: '',
};

const EMPTY_ATTRACTION = {
  name: '', type: '', price_estimate: 0, description: '',
  duration_minutes: 120, opening_hours: '',
};

function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  const [destinations, setDestinations] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [selectedDestId, setSelectedDestId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [destForm, setDestForm] = useState(EMPTY_DESTINATION);
  const [editingDestId, setEditingDestId] = useState(null);

  const [attrForm, setAttrForm] = useState(EMPTY_ATTRACTION);
  const [editingAttrId, setEditingAttrId] = useState(null);
  const attractionsPanelRef = useRef(null);

  useEffect(() => {
    if (!token || !user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    loadDestinations();
  }, []);

  const loadDestinations = () => {
    setLoading(true);
    fetch('http://127.0.0.1:8000/api/destinations?per_page=100')
      .then(r => r.json())
      .then(data => { setDestinations(data.data || []); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  };

  const loadAttractions = (destId) => {
    setSelectedDestId(destId);
    setError('');
    fetch(`http://127.0.0.1:8000/api/destinations/${destId}/attractions`)
      .then(r => r.json())
      .then(data => {
        setAttractions(Array.isArray(data) ? data : []);
        setTimeout(() => {
          attractionsPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      })
      .catch(err => setError(err.message));
  };

  const flash = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSaveDestination = async (e) => {
    e.preventDefault();
    const url = editingDestId
      ? `http://127.0.0.1:8000/api/destinations/${editingDestId}`
      : 'http://127.0.0.1:8000/api/destinations';
    const method = editingDestId ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(destForm),
      });
      const data = await res.json();
      if (!res.ok) {
        const errs = data.errors ? Object.values(data.errors).flat().join(' · ') : (data.message || 'Failed');
        throw new Error(errs);
      }
      flash(editingDestId ? '✓ Destination updated' : '✓ Destination created');
      setDestForm(EMPTY_DESTINATION);
      setEditingDestId(null);
      loadDestinations();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditDestination = (d) => {
    setEditingDestId(d.id);
    setDestForm({
      name: d.name, country: d.country, description: d.description || '',
      trip_type: d.trip_type, season: d.season, budget_level: d.budget_level,
      duration_range: d.duration_range, image_url: d.image_url || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteDestination = async (id) => {
    if (!confirm('Delete this destination and all its attractions?')) return;
    const res = await fetch(`http://127.0.0.1:8000/api/destinations/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      flash('✓ Destination deleted');
      loadDestinations();
      if (selectedDestId === id) {
        setSelectedDestId(null);
        setAttractions([]);
      }
    }
  };

  const handleSaveAttraction = async (e) => {
    e.preventDefault();
    if (!selectedDestId && !editingAttrId) {
      setError('Select a destination first');
      return;
    }

    const url = editingAttrId
      ? `http://127.0.0.1:8000/api/attractions/${editingAttrId}`
      : `http://127.0.0.1:8000/api/destinations/${selectedDestId}/attractions`;
    const method = editingAttrId ? 'PATCH' : 'POST';

    let openingHours = null;
    if (attrForm.opening_hours && attrForm.opening_hours.trim()) {
      try {
        openingHours = JSON.parse(attrForm.opening_hours);
      } catch {
        setError('Opening hours must be valid JSON (e.g. {"mon":"09:00-17:00","tue":"closed"})');
        return;
      }
    }

    const payload = {
      name: attrForm.name,
      type: attrForm.type || null,
      price_estimate: Number(attrForm.price_estimate) || 0,
      description: attrForm.description || null,
      duration_minutes: Number(attrForm.duration_minutes) || null,
      opening_hours: openingHours,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        const errs = data.errors ? Object.values(data.errors).flat().join(' · ') : (data.message || 'Failed');
        throw new Error(errs);
      }
      flash(editingAttrId ? '✓ Attraction updated' : '✓ Attraction added');
      setAttrForm(EMPTY_ATTRACTION);
      setEditingAttrId(null);
      loadAttractions(selectedDestId);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditAttraction = (a) => {
    setEditingAttrId(a.id);
    setAttrForm({
      name: a.name, type: a.type || '', price_estimate: a.price_estimate || 0,
      description: a.description || '',
      duration_minutes: a.duration_minutes || 120,
      opening_hours: a.opening_hours ? JSON.stringify(a.opening_hours, null, 2) : '',
    });
  };

  const handleDeleteAttraction = async (id) => {
    if (!confirm('Delete this attraction?')) return;
    const res = await fetch(`http://127.0.0.1:8000/api/attractions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      flash('✓ Attraction deleted');
      loadAttractions(selectedDestId);
    }
  };

  return (
    <div className="app-shell">
      <div className="page-container">
        <Link to="/" className="back-link">← Back to home</Link>

        <header className="page-header">
          <div>
            <span className="eyebrow">✦ Admin</span>
            <h1 className="page-title">Content management</h1>
            <p className="page-subtitle">Create, edit and remove destinations and their attractions.</p>
          </div>
        </header>

        {error && <p className="error-message">✕ {error}</p>}
        {message && <p className="status-message">{message}</p>}

        <div className="admin-split">
        <div>
        {/* Destination form */}
        <section className="filter-card" style={{ marginBottom: 24 }}>
          <h3>🌍 {editingDestId ? 'Edit destination' : 'Add destination'}</h3>
          <form onSubmit={handleSaveDestination} className="form-grid" style={{ marginTop: 12 }}>
            <input className="form-input" placeholder="Name *" value={destForm.name}
              onChange={e => setDestForm(p => ({ ...p, name: e.target.value }))} required />
            <input className="form-input" placeholder="Country *" value={destForm.country}
              onChange={e => setDestForm(p => ({ ...p, country: e.target.value }))} required />
            <select className="form-input" value={destForm.trip_type}
              onChange={e => setDestForm(p => ({ ...p, trip_type: e.target.value }))}>
              {TRIP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="form-input" value={destForm.season}
              onChange={e => setDestForm(p => ({ ...p, season: e.target.value }))}>
              {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="form-input" value={destForm.budget_level}
              onChange={e => setDestForm(p => ({ ...p, budget_level: e.target.value }))}>
              {BUDGET_LEVELS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <select className="form-input" value={destForm.duration_range}
              onChange={e => setDestForm(p => ({ ...p, duration_range: e.target.value }))}>
              {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input className="form-input" placeholder="Image URL" value={destForm.image_url}
              onChange={e => setDestForm(p => ({ ...p, image_url: e.target.value }))} style={{ gridColumn: '1 / -1' }} />
            <textarea className="form-input" placeholder="Description" rows={2} value={destForm.description}
              onChange={e => setDestForm(p => ({ ...p, description: e.target.value }))} style={{ gridColumn: '1 / -1' }} />
            <div className="button-row" style={{ gridColumn: '1 / -1' }}>
              <button className="btn" type="submit">{editingDestId ? 'Update' : 'Create'}</button>
              {editingDestId && (
                <button type="button" className="btn-ghost" onClick={() => { setEditingDestId(null); setDestForm(EMPTY_DESTINATION); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Destinations list */}
        <section style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 12 }}>Destinations</h3>
          {loading && <p className="info-chip">⟳ Loading…</p>}
          <div className="stack">
            {destinations.map(d => (
              <article key={d.id} className="destination-card"
                style={selectedDestId === d.id ? { borderColor: 'var(--primary)', boxShadow: '0 0 0 2px var(--primary-light)' } : undefined}>
                <div className="card-top">
                  <div>
                    <h2 className="card-heading">{d.name}</h2>
                    <p className="card-description">{d.country} · {d.trip_type} · {d.season}</p>
                  </div>
                  <span className="badge">{d.budget_level}</span>
                </div>
                <hr className="card-divider" />
                <div className="button-row">
                  <button className="btn-secondary" onClick={() => loadAttractions(d.id)}>Manage attractions →</button>
                  <button className="btn-ghost" onClick={() => handleEditDestination(d)}>Edit</button>
                  <button className="btn-ghost" onClick={() => handleDeleteDestination(d.id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        </section>
        </div>

        {/* RIGHT column: Attractions panel */}
        <div>
        {!selectedDestId && (
          <div className="admin-empty-right">
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: 8 }}>📍</span>
            <strong>Select a destination</strong>
            <p style={{ fontSize: '0.9rem', marginTop: 6 }}>
              Click <em>Manage attractions →</em> on any destination to add or edit its attractions here.
            </p>
          </div>
        )}
        {selectedDestId && (
          <section ref={attractionsPanelRef} className="filter-card">
            <h3>📍 Attractions for: {destinations.find(d => d.id === selectedDestId)?.name}</h3>

            <form onSubmit={handleSaveAttraction} className="form-grid" style={{ marginTop: 12 }}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-input" value={attrForm.name}
                  onChange={e => setAttrForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Type (e.g. museum)</label>
                <input className="form-input" value={attrForm.type}
                  onChange={e => setAttrForm(p => ({ ...p, type: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Price (€)</label>
                <input className="form-input" type="number" min="0" step="0.01"
                  value={attrForm.price_estimate}
                  onChange={e => setAttrForm(p => ({ ...p, price_estimate: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Duration (minutes)</label>
                <input className="form-input" type="number" min="0"
                  value={attrForm.duration_minutes}
                  onChange={e => setAttrForm(p => ({ ...p, duration_minutes: e.target.value }))} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={2} value={attrForm.description}
                  onChange={e => setAttrForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">
                  Opening hours (JSON format)
                </label>
                <small style={{ color: 'var(--text-soft)', marginBottom: 4, display: 'block' }}>
                  Example: <code>{'{"mon":"09:00-17:00","tue":"closed","wed":"09:00-17:00"}'}</code>
                </small>
                <textarea className="form-input"
                  rows={3} value={attrForm.opening_hours}
                  onChange={e => setAttrForm(p => ({ ...p, opening_hours: e.target.value }))}
                  style={{ fontFamily: 'monospace', fontSize: '0.85rem' }} />
              </div>
              <div className="button-row" style={{ gridColumn: '1 / -1' }}>
                <button className="btn" type="submit">{editingAttrId ? 'Update attraction' : 'Add attraction'}</button>
                {editingAttrId && (
                  <button type="button" className="btn-ghost" onClick={() => { setEditingAttrId(null); setAttrForm(EMPTY_ATTRACTION); }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <hr className="card-divider" style={{ margin: '20px 0' }} />

            {attractions.length === 0 && (
              <p style={{ color: 'var(--text-soft)' }}>No attractions yet for this destination.</p>
            )}

            <div className="stack">
              {attractions.map(a => (
                <div key={a.id} className="profile-bar">
                  <div className="profile-meta" style={{ flex: 1 }}>
                    <strong>{a.name}</strong>
                    {a.type && (
                      <small><span style={{ color: 'var(--text-muted)' }}>Type:</span> {a.type}</small>
                    )}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
                      <span style={{ fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>💶 Price:</span>{' '}
                        <strong>€{Number(a.price_estimate).toFixed(2)}</strong>
                      </span>
                      <span style={{ fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>⏱ Duration:</span>{' '}
                        <strong>{a.duration_minutes ? `${a.duration_minutes} min` : '—'}</strong>
                      </span>
                    </div>
                    {a.description && <p style={{ color: 'var(--text-soft)', fontSize: '0.85rem', marginTop: 6 }}>{a.description}</p>}
                  </div>
                  <button className="btn-ghost" onClick={() => handleEditAttraction(a)}>Edit</button>
                  <button className="btn-ghost" onClick={() => handleDeleteAttraction(a.id)}>Delete</button>
                </div>
              ))}
            </div>
          </section>
        )}
        </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
