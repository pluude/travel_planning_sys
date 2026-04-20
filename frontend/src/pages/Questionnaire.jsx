import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const QUESTIONS = [
  {
    key: 'trip_type',
    label: 'Trip type',
    icon: '✈',
    options: ['romantic', 'relaxation', 'adventure', 'sightseeing'],
  },
  {
    key: 'season',
    label: 'Season',
    icon: '☀',
    options: ['spring', 'summer', 'autumn', 'winter'],
  },
  {
    key: 'budget_level',
    label: 'Budget level',
    icon: '◈',
    options: ['low', 'medium', 'high'],
  },
  {
    key: 'duration_range',
    label: 'Duration',
    icon: '◷',
    options: ['3-5 days', '5-7 days', '1 week'],
  },
];

function Questionnaire() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    trip_type: '',
    season: '',
    budget_level: '',
    duration_range: '',
  });

  const [recommendations, setRecommendations] = useState(
  JSON.parse(sessionStorage.getItem('recommendations') || '[]')
);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);



  const handleSelect = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setRecommendations([]);
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch recommendations');

     setRecommendations(data);
      sessionStorage.setItem('recommendations', JSON.stringify(data));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filledCount = Object.values(formData).filter(Boolean).length;

  return (
    <div className="app-shell">
      <div className="page-container">

        <Link to="/" className="back-link">← Back to destinations</Link>

        <header className="page-header" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '32px' }}>
          <div>
            <span className="eyebrow">✦ Find your match</span>
            <h1 className="page-title" style={{ margin: '16px 0 10px' }}>Travel Questionnaire</h1>
            <p className="page-subtitle" style={{ margin: '0 auto' }}>
              Select your preferences below and we'll recommend your top 3 matching destinations.
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit}>
          <section className="questionnaire-card">
            <div className="questionnaire-grid">
              {QUESTIONS.map((q) => (
                <div key={q.key} className="question-block">
                  <label className="question-label">
                    <span className="question-icon">{q.icon}</span>
                    {q.label}
                  </label>
                  <div className="option-chips">
                    {q.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`option-chip${formData[q.key] === opt ? ' selected' : ''}`}
                        onClick={() => handleSelect(q.key, opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="questionnaire-submit-row">
              <button className="btn" type="submit" disabled={loading || filledCount < 4}>
                {loading ? '⟳ Finding matches…' : 'Get recommendations →'}
              </button>
              {filledCount < 4 && (
                <span className="submit-hint">
                  {4 - filledCount} more selection{4 - filledCount !== 1 ? 's' : ''} needed
                </span>
              )}
            </div>
          </section>
        </form>

        {error && <p className="error-message">✕ {error}</p>}

        {recommendations.length > 0 && (
          <>
            <div className="section-divider">
              <div className="section-divider-line" />
              <span className="section-divider-label">
                {recommendations[0].match_percent < 40
                  ? 'No strong match — but you might like these'
                  : 'Top 3 recommendations'}
              </span>
              <div className="section-divider-line" />
            </div>

            <div className="recommendation-grid">
              {recommendations.map((item, index) => (
                <article
                  key={item.destination.id}
                  className="recommendation-card"
                  onClick={() => navigate(`/destination/${item.destination.id}`)}
                >
                  {item.destination.image_url && (
                    <div className="card-media">
                      <img
                        src={item.destination.image_url}
                        alt={item.destination.name}
                        loading="lazy"
                        onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <div className="recommendation-rank">
                    #{index + 1} match · {item.match_percent}% match
                  </div>

                  <div className="card-top">
                    <div>
                      <h2 className="card-heading">{item.destination.name}</h2>
                      <p className="card-description">{item.destination.description}</p>
                    </div>
                  </div>

                

                  <hr className="card-divider" />

                  <div className="details-grid">
                    <div className="detail-pill">
                      <span>Country</span>
                      <strong>{item.destination.country}</strong>
                    </div>
                    <div className="detail-pill">
                      <span>Trip type</span>
                      <strong>{item.destination.trip_type}</strong>
                    </div>
                    <div className="detail-pill">
                      <span>Season</span>
                      <strong>{item.destination.season}</strong>
                    </div>
                    <div className="detail-pill">
                      <span>Budget</span>
                      <strong>{item.destination.budget_level}</strong>
                    </div>
                    <div className="detail-pill">
                      <span>Duration</span>
                      <strong>{item.destination.duration_range}</strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default Questionnaire;
