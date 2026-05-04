import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { iconForType } from '../constants/attractionIcons';

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

function DestinationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [destination, setDestination] = useState(null);
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [feedback, setFeedback] = useState([]);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: '' });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

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

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/feedback?subject_type=destination&destination_id=${id}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setFeedback(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [id]);

  const submitFeedback = async (e) => {
    e.preventDefault();
    setFeedbackMessage('');
    if (!token) { setFeedbackMessage('✕ Please log in to submit feedback'); return; }
    if (!feedbackForm.comment.trim()) return;

    setSubmittingFeedback(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject_type: 'destination',
          destination_id: Number(id),
          rating: Number(feedbackForm.rating),
          comment: feedbackForm.comment,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errs = data.errors ? Object.values(data.errors).flat().join(' · ') : (data.message || 'Failed');
        throw new Error(errs);
      }
      setFeedback(prev => [data, ...prev]);
      setFeedbackForm({ rating: 5, comment: '' });
      setFeedbackMessage('✓ Thanks for your feedback!');
      setTimeout(() => setFeedbackMessage(''), 3000);
    } catch (err) {
      setFeedbackMessage(`✕ ${err.message}`);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const deleteFeedback = async (fid) => {
    if (!token) return;
    if (!confirm('Delete this feedback?')) return;
    const res = await fetch(`http://127.0.0.1:8000/api/feedback/${fid}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setFeedback(prev => prev.filter(f => f.id !== fid));
  };

  const averageRating = feedback.length
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
    : null;

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

              <section className="detail-card">
                <div className="detail-copy" style={{ marginBottom: 16 }}>
                  <span className="eyebrow">✦ Travelers' feedback</span>
                  <h2 className="card-heading" style={{ marginTop: 12, fontSize: '1.35rem' }}>
                    {feedback.length === 0
                      ? 'No comments yet'
                      : `${feedback.length} comment${feedback.length !== 1 ? 's' : ''}`}
                    {averageRating && (
                      <span style={{ marginLeft: 12, fontSize: '1rem', color: 'var(--text-soft)' }}>
                        · avg <StarDisplay value={Math.round(averageRating)} /> {averageRating}/5
                      </span>
                    )}
                  </h2>
                </div>

                <form onSubmit={submitFeedback} className="form-grid" style={{ marginBottom: 20 }}>
                  {!user && (
                    <p className="info-chip">
                      ℹ <Link to={`/login?redirect=/destination/${id}`}>Log in</Link> to leave feedback for this destination.
                    </p>
                  )}
                  <div className="form-group">
                    <label className="form-label">Your rating</label>
                    <StarPicker
                      value={feedbackForm.rating}
                      onChange={n => setFeedbackForm(p => ({ ...p, rating: n }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Your comment</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      placeholder="Share what you loved, tips for fellow travelers, or things to watch out for…"
                      value={feedbackForm.comment}
                      onChange={e => setFeedbackForm(p => ({ ...p, comment: e.target.value }))}
                      maxLength={2000}
                      disabled={!user}
                    />
                  </div>
                  <div className="button-row">
                    <button
                      className="btn"
                      type="submit"
                      disabled={!user || submittingFeedback || !feedbackForm.comment.trim()}
                      style={(!user || submittingFeedback || !feedbackForm.comment.trim())
                        ? { opacity: 0.5, cursor: 'not-allowed' }
                        : undefined}
                    >
                      {submittingFeedback ? 'Submitting…' : 'Post comment →'}
                    </button>
                  </div>
                  {feedbackMessage && (
                    <p className={feedbackMessage.startsWith('✓') ? 'status-message' : 'error-message'}>
                      {feedbackMessage}
                    </p>
                  )}
                </form>

                {feedback.length > 0 && (
                  <div className="stack">
                    {feedback.map(f => (
                      <article key={f.id} className="profile-bar">
                        <div className="profile-meta" style={{ flex: 1 }}>
                          <small>
                            by {f.user?.name || 'Anonymous'} · {new Date(f.created_at).toLocaleDateString()}
                          </small>
                          <strong style={{ marginTop: 4 }}><StarDisplay value={f.rating} /></strong>
                          <p style={{ marginTop: 6, color: 'var(--text-soft)' }}>{f.comment}</p>
                        </div>
                        {user && (user.id === f.user_id || user.role === 'admin') && (
                          <button className="btn-ghost" onClick={() => deleteFeedback(f.id)}>Delete</button>
                        )}
                      </article>
                    ))}
                  </div>
                )}
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