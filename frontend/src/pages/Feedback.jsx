import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function StarDisplay({ value }) {
  return (
    <span style={{ color: '#e6b800', letterSpacing: 1 }}>
      {'★'.repeat(value)}<span style={{ color: '#ddd' }}>{'★'.repeat(5 - value)}</span>
    </span>
  );
}

function StarPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          style={{
            background: 'transparent',
            color: n <= value ? '#e6b800' : '#ccc',
            fontSize: '1.6rem',
            lineHeight: 1,
            padding: 0,
          }}
          aria-label={`${n} stars`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function Feedback() {
  const [feedback, setFeedback] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    subject_type: 'system',
    destination_id: '',
    rating: 5,
    comment: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  const loadFeedback = () => {
    let url = 'http://127.0.0.1:8000/api/feedback';
    if (filter === 'system') url += '?subject_type=system';
    else if (filter === 'destination') url += '?subject_type=destination';

    fetch(url)
      .then(r => r.json())
      .then(data => { setFeedback(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  };

  useEffect(() => {
    setLoading(true);
    loadFeedback();
  }, [filter]);

  useEffect(() => {
    // Need destinations list for the picker (paginated → fetch a generous page size)
    fetch('http://127.0.0.1:8000/api/destinations?per_page=100')
      .then(r => r.json())
      .then(data => setDestinations(data.data || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!token) { setMessage('✕ Please log in to submit feedback'); return; }

    setSubmitting(true);
    try {
      const payload = {
        subject_type: form.subject_type,
        rating: Number(form.rating),
        comment: form.comment,
      };
      if (form.subject_type === 'destination') {
        payload.destination_id = Number(form.destination_id);
      }

      const res = await fetch('http://127.0.0.1:8000/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        const errs = data.errors ? Object.values(data.errors).flat().join(' · ') : (data.message || 'Failed');
        throw new Error(errs);
      }

      setFeedback(prev => [data, ...prev]);
      setForm({ subject_type: 'system', destination_id: '', rating: 5, comment: '' });
      setMessage('✓ Feedback submitted, thank you!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(`✕ ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!token) return;
    if (!confirm('Delete this feedback?')) return;
    const res = await fetch(`http://127.0.0.1:8000/api/feedback/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setFeedback(prev => prev.filter(f => f.id !== id));
    }
  };

  const formValid =
    form.comment.trim().length > 0 &&
    (form.subject_type === 'system' || form.destination_id);

  return (
    <div className="app-shell">
      <div className="page-container">
        <Link to="/" className="back-link">← Back to home</Link>

        <header className="page-header">
          <div>
            <span className="eyebrow">✦ Community</span>
            <h1 className="page-title">Feedback & suggestions</h1>
            <p className="page-subtitle">Share your experience about destinations or the system itself.</p>
          </div>
        </header>

        {/* Submit form */}
        <section className="filter-card" style={{ marginBottom: 24 }}>
          <h3>Leave feedback</h3>
          {!user && (
            <p className="info-chip" style={{ marginTop: 8 }}>
              ℹ <Link to="/login?redirect=/feedback">Log in</Link> to submit feedback.
            </p>
          )}

          <form onSubmit={handleSubmit} className="form-grid" style={{ marginTop: 12 }}>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <div className="option-chips">
                <button
                  type="button"
                  className="option-chip"
                  onClick={() => setForm(p => ({ ...p, subject_type: 'system', destination_id: '' }))}
                  style={form.subject_type === 'system' ? { background: 'var(--primary)', color: '#fff', borderColor: 'transparent' } : undefined}
                >
                  💻 The system
                </button>
                <button
                  type="button"
                  className="option-chip"
                  onClick={() => setForm(p => ({ ...p, subject_type: 'destination' }))}
                  style={form.subject_type === 'destination' ? { background: 'var(--primary)', color: '#fff', borderColor: 'transparent' } : undefined}
                >
                  🌍 A destination
                </button>
              </div>
            </div>

            {form.subject_type === 'destination' && (
              <div className="form-group">
                <label className="form-label">Pick a destination</label>
                <select
                  className="form-input"
                  value={form.destination_id}
                  onChange={e => setForm(p => ({ ...p, destination_id: e.target.value }))}
                  required
                >
                  <option value="">— select —</option>
                  {destinations.map(d => (
                    <option key={d.id} value={d.id}>{d.name}, {d.country}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Rating</label>
              <StarPicker
                value={form.rating}
                onChange={n => setForm(p => ({ ...p, rating: n }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Comment</label>
              <textarea
                className="form-input"
                rows={4}
                placeholder="What did you like? What could be improved?"
                value={form.comment}
                onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
                maxLength={2000}
                required
              />
            </div>

            <div className="button-row">
              <button
                className="btn"
                type="submit"
                disabled={!user || submitting || !formValid}
                style={(!user || submitting || !formValid) ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
              >
                {submitting ? 'Submitting…' : 'Submit feedback →'}
              </button>
            </div>

            {message && (
              <p className={message.startsWith('✓') ? 'status-message' : 'error-message'}>{message}</p>
            )}
          </form>
        </section>

        {/* Filters */}
        <div className="option-chips" style={{ marginBottom: 16 }}>
          {[
            { key: 'all', label: 'All' },
            { key: 'system', label: '💻 System' },
            { key: 'destination', label: '🌍 Destinations' },
          ].map(opt => (
            <button
              key={opt.key}
              className="option-chip"
              onClick={() => setFilter(opt.key)}
              style={filter === opt.key ? { background: 'var(--primary)', color: '#fff', borderColor: 'transparent' } : undefined}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading && <p className="info-chip">⟳ Loading feedback…</p>}
        {error && <p className="error-message">✕ {error}</p>}
        {!loading && feedback.length === 0 && (
          <div className="empty-state">
            <span className="empty-state-icon">💭</span>
            No feedback yet — be the first to share!
          </div>
        )}

        <div className="stack">
          {feedback.map(f => (
            <article key={f.id} className="profile-bar">
              <div className="profile-meta" style={{ flex: 1 }}>
                <small>
                  {f.subject_type === 'system'
                    ? '💻 System feedback'
                    : `🌍 ${f.destination?.name || 'Destination'}`}
                  {' · '}
                  by {f.user?.name || 'Anonymous'}
                  {' · '}
                  {new Date(f.created_at).toLocaleDateString()}
                </small>
                <strong style={{ marginTop: 4 }}><StarDisplay value={f.rating} /></strong>
                <p style={{ marginTop: 6, color: 'var(--text-soft)' }}>{f.comment}</p>
              </div>
              {user && (user.id === f.user_id || user.role === 'admin') && (
                <button className="btn-ghost" onClick={() => handleDelete(f.id)}>Delete</button>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Feedback;
