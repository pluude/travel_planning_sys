import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Destinations() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  const user = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user'))
    : null;
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/destinations')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        setDestinations(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    setAuthMessage('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/logout', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Logout failed');
      }

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setAuthMessage('Logout successful');

      setTimeout(() => {
        navigate('/login');
      }, 500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
      <h1>Travel Planning System</h1>

      <div style={{ marginBottom: '24px' }}>
        {user ? (
          <>
            <p>
              <strong>Logged in as:</strong> {user.name} ({user.email})
            </p>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <p>
            <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
          </p>
        )}
      </div>
      <p style={{ marginBottom: '24px' }}>
  <Link to="/questionnaire">Go to questionnaire</Link>
</p>

      {authMessage && <p><strong>{authMessage}</strong></p>}

      <h2>Destinations</h2>

      {loading && <p>Loading destinations...</p>}
      {error && <p><strong>Error:</strong> {error}</p>}

      {!loading && !error && destinations.length === 0 && (
        <p>No destinations found.</p>
      )}

      {!loading && !error && destinations.map((destination) => (
        <div
          key={destination.id}
          onClick={() => navigate(`/destination/${destination.id}`)}
          style={{
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
            textAlign: 'left',
            cursor: 'pointer'
          }}
        >
          <h3>{destination.name}</h3>
          <p><strong>Country:</strong> {destination.country}</p>
          <p><strong>Description:</strong> {destination.description}</p>
          <p><strong>Trip type:</strong> {destination.trip_type}</p>
          <p><strong>Season:</strong> {destination.season}</p>
          <p><strong>Budget:</strong> {destination.budget_level}</p>
          <p><strong>Duration:</strong> {destination.duration_range}</p>
        </div>
      ))}
    </div>
  );
}

export default Destinations;