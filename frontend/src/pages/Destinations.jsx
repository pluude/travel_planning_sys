import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function buildPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  if (current <= 3) { pages.add(2); pages.add(3); pages.add(4); }
  if (current >= total - 2) { pages.add(total - 3); pages.add(total - 2); pages.add(total - 1); }
  const sorted = [...pages].filter(p => p >= 1 && p <= total).sort((a, b) => a - b);
  const result = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push('…');
    result.push(p);
    prev = p;
  }
  return result;
}

function Destinations() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const user = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user'))
    : null;
  const token = localStorage.getItem('token');

  useEffect(() => {
    setLoading(true);
    fetch(`http://127.0.0.1:8000/api/destinations?page=${currentPage}`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
        return response.json();
      })
      .then((data) => {
        setDestinations(data.data);
        setTotalPages(data.last_page);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [currentPage]);

  const handleLogout = async () => {
    setAuthMessage('');
    try {
      const response = await fetch('http://127.0.0.1:8000/api/logout', {
        method: 'POST',
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Logout failed');

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('recommendations');
      setAuthMessage('Logout successful');

      setTimeout(() => navigate('/login'), 500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app-shell">
      <div className="page-container">

        <header className="page-header">
          <div>
            <span className="eyebrow">✦ Explore travel ideas</span>
            <h1 className="page-title">Destinations</h1>
            <p className="page-subtitle">
              Browse available travel destinations, open full details, and head to the
              questionnaire for tailored recommendations.
            </p>
          </div>

          <div className="top-actions">
            <Link to="/questionnaire" className="btn">Get recommendations →</Link>
            <Link to="/feedback" className="btn-secondary">💬 Feedback</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="btn-secondary">⚙ Admin</Link>
            )}
            {!user && (
              <>
                <Link to="/login" className="btn-secondary">Login</Link>
                <Link to="/register" className="btn-ghost">Register</Link>
              </>
            )}
          </div>
        </header>

        {user && (
          <section className="profile-bar">
            <div className="profile-meta">
              <small>Logged in as</small>
              <strong>{user.name} — {user.email}</strong>
            </div>
            <div className="profile-actions">
              <Link to="/trip-plans" className="btn-secondary">My plans</Link>
              <button className="btn-secondary" onClick={handleLogout}>Logout</button>
            </div>
          </section>
        )}

        {authMessage && <p className="status-message">✓ {authMessage}</p>}
        {error && <p className="error-message">✕ {error}</p>}

        <div className="grid-layout">
          <main className="stack">
            {loading && (
              <div className="empty-state">
                <span className="empty-state-icon">🌍</span>
                <p style={{ fontWeight: 600 }}>Loading destinations…</p>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: 6 }}>
                  This may take a moment on slower connections.
                </p>
              </div>
            )}

            {!loading && !error && destinations.length === 0 && (
              <div className="empty-state">
                <span className="empty-state-icon">🗺️</span>
                No destinations found.
              </div>
            )}

            {!loading && !error && destinations.length > 0 && (
              <>
                <div className="destination-grid">
                  {destinations.map((destination) => (
                    <article
                      key={destination.id}
                      className="destination-card"
                      onClick={() => navigate(`/destination/${destination.id}`)}
                    >
                      {destination.image_url && (
                        <div className="card-media">
                          <img
                            src={destination.image_url}
                            alt={destination.name}
                            loading="lazy"
                            onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
                          />
                        </div>
                      )}
                      <div className="card-top">
                        <div>
                          <h2 className="card-heading">{destination.name}</h2>
                          <p className="card-description">{destination.description}</p>
                        </div>
                        <span className="badge">{destination.country}</span>
                      </div>


                      <hr className="card-divider" />

                      <div className="details-grid">
                        <div className="detail-pill">
                          <span>Country</span>
                          <strong>{destination.country}</strong>
                        </div>
                        <div className="detail-pill">
                          <span>Trip type</span>
                          <strong>{destination.trip_type}</strong>
                        </div>
                        <div className="detail-pill">
                          <span>Season</span>
                          <strong>{destination.season}</strong>
                        </div>
                        <div className="detail-pill">
                          <span>Budget</span>
                          <strong>{destination.budget_level}</strong>
                        </div>
                        <div className="detail-pill">
                          <span>Duration</span>
                          <strong>{destination.duration_range}</strong>
                        </div>
                      </div>
                      <div style={{ marginTop: 12 }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                        View details →
                      </span>
                    </div>
                    </article>
                  ))}
                </div>

                {totalPages > 1 && (
                  <nav className="pagination" aria-label="Destinations pagination">
                    <button
                      className="page-btn"
                      onClick={() => setCurrentPage(p => p - 1)}
                      disabled={currentPage === 1}
                      aria-label="Previous page"
                    >
                      ←
                    </button>
                    {buildPageList(currentPage, totalPages).map((item, idx) => (
                      item === '…' ? (
                        <span key={`e-${idx}`} className="page-ellipsis">…</span>
                      ) : (
                        <button
                          key={item}
                          className={`page-btn ${item === currentPage ? 'page-btn-active' : ''}`}
                          onClick={() => setCurrentPage(item)}
                          aria-current={item === currentPage ? 'page' : undefined}
                        >
                          {item}
                        </button>
                      )
                    ))}
                    <button
                      className="page-btn"
                      onClick={() => setCurrentPage(p => p + 1)}
                      disabled={currentPage === totalPages}
                      aria-label="Next page"
                    >
                      →
                    </button>
                  </nav>
                )}
              </>
            )}
          </main>

          <aside className="stack">
            <section className="filter-card">
              <h3>How to use this page</h3>
              <div className="info-list">
                <div className="info-list-item">
                  <div className="hero-point-icon">1</div>
                  <div>
                    <strong>Browse the list</strong>
                    <p>Each card shows trip type, season, budget, and duration at a glance.</p>
                  </div>
                </div>
                <div className="info-list-item">
                  <div className="hero-point-icon">2</div>
                  <div>
                    <strong>Open details</strong>
                    <p>Click any card to open the full destination details page.</p>
                  </div>
                </div>
                <div className="info-list-item">
                  <div className="hero-point-icon">3</div>
                  <div>
                    <strong>Get recommendations</strong>
                    <p>Use the questionnaire to receive your top 3 matching destinations.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="info-card">
              <h3>Quick actions</h3>
              <div className="button-row">
                <Link to="/questionnaire" className="btn">Recommendation form</Link>
                {!user && (
                  <Link to="/register" className="btn-ghost">Create account</Link>
                )}
              </div>
            </section>
          </aside>
        </div>

      </div>
    </div>
  );
}

export default Destinations;