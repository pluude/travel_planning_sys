import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { iconForType } from '../constants/attractionIcons';

function TripPlanDetails() {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newActivity, setNewActivity] = useState({});
  const [activityError, setActivityError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/trip-plans/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setPlan(data);
        setLoading(false);

        // Fetch attractions pagal destinaciją ir biudžetą
        const budgetParam = data.budget_limit ? `?budget_limit=${data.budget_limit}` : '';
        return fetch(`http://127.0.0.1:8000/api/destinations/${data.destination_id}/attractions${budgetParam}`);
      })
      .then(r => r.json())
      .then(data => setAttractions(data))
      .catch(err => { setError(err.message); setLoading(false); });
  }, [id]);

  const handleAddActivity = async (dayId) => {
    setActivityError('');
    const activity = newActivity[dayId];
    if (!activity?.name) { setActivityError('Activity name is required'); return; }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/trip-days/${dayId}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(activity),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to add activity');

      setPlan(prev => ({
        ...prev,
        trip_days: prev.trip_days.map(day =>
          day.id === dayId
            ? { ...day, activities: [...(day.activities || []), data] }
            : day
        ),
      }));

      setNewActivity(prev => ({ ...prev, [dayId]: {} }));
    } catch (err) {
      setActivityError(err.message);
    }
  };

  const handleAddSuggested = (dayId, attraction) => {
    setNewActivity(prev => ({
      ...prev,
      [dayId]: {
        name: attraction.name,
        type: attraction.type,
        cost: attraction.price_estimate,
        notes: attraction.description,
        start_time: '',
      }
    }));
  };

  const handleDeleteActivity = async (dayId, activityId) => {
    await fetch(`http://127.0.0.1:8000/api/activities/${activityId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    setPlan(prev => ({
      ...prev,
      trip_days: prev.trip_days.map(day =>
        day.id === dayId
          ? { ...day, activities: day.activities.filter(a => a.id !== activityId) }
          : day
      ),
    }));
  };

  if (loading) return <div className="app-shell"><p className="info-chip">⟳ Loading…</p></div>;
  if (error) return <div className="app-shell"><p className="error-message">✕ {error}</p></div>;
  if (!plan) return null;

  return (
    <div className="app-shell">
      <div className="page-container">
        <Link to="/trip-plans" className="back-link">← Back to my plans</Link>

        <header className="page-header">
          <div>
            <span className="eyebrow">✦ Trip plan</span>
            <h1 className="page-title">{plan.title}</h1>
            <p className="page-subtitle">
              {plan.destination?.name}, {plan.destination?.country} · {plan.start_date} → {plan.end_date}
              {plan.budget_limit && ` · Budget: €${plan.budget_limit}`}
            </p>
          </div>
        </header>

        {activityError && <p className="error-message">✕ {activityError}</p>}

        {/* Atrakcijų pasiūlymai */}
        {attractions.length > 0 && (
          <section className="filter-card" style={{ marginBottom: 24 }}>
            <h3>Suggested attractions for {plan.destination?.name}</h3>
            <div className="tags-row">
              {attractions.map(attraction => (
                <div key={attraction.id} className="destination-card" style={{ padding: '12px 16px', cursor: 'default' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div className="attraction-icon" aria-hidden="true" style={{ width: 36, height: 36, fontSize: '1.2rem' }}>
                      {iconForType(attraction.type)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: '0.95rem' }}>{attraction.name}</strong>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-soft)', margin: '4px 0' }}>{attraction.description}</p>
                      <span className="tag">{attraction.type}</span>
                      {attraction.price_estimate > 0 && (
                        <span className="badge" style={{ marginLeft: 6 }}>€{attraction.price_estimate}</span>
                      )}
                      {attraction.price_estimate === 0 && (
                        <span className="badge" style={{ marginLeft: 6 }}>Free</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="stack">
          {plan.trip_days?.map(day => (
            <div key={day.id} className="detail-card">
              <h2 className="card-heading">Day {day.day_number} — {day.date}</h2>

              {day.activities?.length > 0 && (
                <div className="stack" style={{ marginTop: 16, marginBottom: 20 }}>
                  {day.activities.map(activity => (
                    <div key={activity.id} className="profile-bar">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                        <div className="attraction-icon" aria-hidden="true" style={{ width: 36, height: 36, fontSize: '1.2rem' }}>
                          {iconForType(activity.type)}
                        </div>
                        <div className="profile-meta">
                          <strong>{activity.name}</strong>
                          <small>
                            {activity.type && `${activity.type} · `}
                            {activity.start_time && `${activity.start_time} · `}
                            {activity.cost > 0 && `€${activity.cost}`}
                          </small>
                          {activity.notes && <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)' }}>{activity.notes}</p>}
                        </div>
                      </div>
                      <button
                        className="btn-ghost"
                        onClick={() => handleDeleteActivity(day.id, activity.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {day.activities?.length === 0 && (
                <div className="empty-state" style={{ marginTop: 12, marginBottom: 16 }}>
                  <span className="empty-state-icon">📍</span>
                  No activities yet.
                </div>
              )}

              <hr className="card-divider" />

              {/* Greitas pridėjimas iš pasiūlymų */}
              {attractions.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quick add from suggestions</p>
                  <div className="option-chips">
                    {attractions.map(attraction => (
                      <button
                        key={attraction.id}
                        className="option-chip"
                        onClick={() => handleAddSuggested(day.id, attraction)}
                      >
                        <span aria-hidden="true" style={{ marginRight: 6 }}>{iconForType(attraction.type)}</span>
                        {attraction.name} {attraction.price_estimate > 0 ? `€${attraction.price_estimate}` : '(free)'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <input
                  className="form-input"
                  placeholder="Activity name *"
                  value={newActivity[day.id]?.name || ''}
                  onChange={e => setNewActivity(prev => ({ ...prev, [day.id]: { ...prev[day.id], name: e.target.value } }))}
                />
                <input
                  className="form-input"
                  placeholder="Type (e.g. museum)"
                  value={newActivity[day.id]?.type || ''}
                  onChange={e => setNewActivity(prev => ({ ...prev, [day.id]: { ...prev[day.id], type: e.target.value } }))}
                />
                <input
                  className="form-input"
                  type="time"
                  value={newActivity[day.id]?.start_time || ''}
                  onChange={e => setNewActivity(prev => ({ ...prev, [day.id]: { ...prev[day.id], start_time: e.target.value } }))}
                />
                <input
                  className="form-input"
                  type="number"
                  placeholder="Cost (€)"
                  value={newActivity[day.id]?.cost || ''}
                  onChange={e => setNewActivity(prev => ({ ...prev, [day.id]: { ...prev[day.id], cost: e.target.value } }))}
                />
                <input
                  className="form-input"
                  placeholder="Notes"
                  value={newActivity[day.id]?.notes || ''}
                  onChange={e => setNewActivity(prev => ({ ...prev, [day.id]: { ...prev[day.id], notes: e.target.value } }))}
                />
                <button className="btn" onClick={() => handleAddActivity(day.id)}>
                  + Add activity
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default TripPlanDetails;