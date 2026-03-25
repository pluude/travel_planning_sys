import { useState } from 'react';
import { Link } from 'react-router-dom';

function Questionnaire() {
  const [formData, setFormData] = useState({
    trip_type: '',
    season: '',
    budget_level: '',
    duration_range: '',
  });

  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setRecommendations([]);
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch recommendations');
      }

      setRecommendations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px', textAlign: 'left' }}>
      <p><Link to="/">← Back to destinations</Link></p>

      <h1>Travel Questionnaire</h1>
      <p>Answer these questions to get 3 destination recommendations.</p>

      <form onSubmit={handleSubmit} style={{ marginBottom: '32px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label>Trip type</label>
          <br />
          <select
            name="trip_type"
            value={formData.trip_type}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="">Select trip type</option>
            <option value="romantic">Romantic</option>
            <option value="relaxation">Relaxation</option>
            <option value="adventure">Adventure</option>
            <option value="sightseeing">Sightseeing</option>
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label>Season</label>
          <br />
          <select
            name="season"
            value={formData.season}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="">Select season</option>
            <option value="spring">Spring</option>
            <option value="summer">Summer</option>
            <option value="autumn">Autumn</option>
            <option value="winter">Winter</option>
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label>Budget level</label>
          <br />
          <select
            name="budget_level"
            value={formData.budget_level}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="">Select budget</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label>Duration</label>
          <br />
          <select
            name="duration_range"
            value={formData.duration_range}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="">Select duration</option>
            <option value="3-5 days">3-5 days</option>
            <option value="5-7 days">5-7 days</option>
            <option value="1 week">1 week</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Get Recommendations'}
        </button>
      </form>

      {error && <p><strong>Error:</strong> {error}</p>}

      {recommendations.length > 0 && (
        <div>
          <h2>Top 3 Recommendations</h2>

          {recommendations.map((item, index) => (
            <div
              key={item.destination.id}
              style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <h3>#{index + 1} {item.destination.name}</h3>
              <p><strong>Country:</strong> {item.destination.country}</p>
              <p><strong>Description:</strong> {item.destination.description}</p>
              <p><strong>Trip type:</strong> {item.destination.trip_type}</p>
              <p><strong>Season:</strong> {item.destination.season}</p>
              <p><strong>Budget:</strong> {item.destination.budget_level}</p>
              <p><strong>Duration:</strong> {item.destination.duration_range}</p>
              <p><strong>Match score:</strong> {item.score}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Questionnaire;