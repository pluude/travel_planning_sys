import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

function DestinationDetails() {
  const { id } = useParams();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/destinations/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        setDestination(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px', textAlign: 'left' }}>
      <p><Link to="/">← Back to destinations</Link></p>

      {loading && <p>Loading destination...</p>}
      {error && <p><strong>Error:</strong> {error}</p>}

      {!loading && !error && destination && (
        <div
          style={{
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '16px',
          }}
        >
          <h1>{destination.name}</h1>
          <p><strong>Country:</strong> {destination.country}</p>
          <p><strong>Description:</strong> {destination.description}</p>
          <p><strong>Trip type:</strong> {destination.trip_type}</p>
          <p><strong>Season:</strong> {destination.season}</p>
          <p><strong>Budget:</strong> {destination.budget_level}</p>
          <p><strong>Duration:</strong> {destination.duration_range}</p>
          <p><strong>Categories:</strong> Not implemented yet</p>
        </div>
      )}
    </div>
  );
}

export default DestinationDetails;