import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { iconForType } from '../constants/attractionIcons';

const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

// Normalize "HH:MM" or "HH:MM:SS" → "HH:MM"
function normalizeTime(t) {
  if (!t || typeof t !== 'string') return null;
  const m = t.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return `${m[1].padStart(2, '0')}:${m[2]}`;
}

// Get the hours string ("HH:MM-HH:MM" | "closed" | null) for a given ISO date
function hoursForDate(openingHours, isoDate) {
  if (!openingHours || !isoDate) return null;
  const key = WEEKDAY_KEYS[new Date(isoDate).getDay()];
  return openingHours[key] ?? null;
}

// Parse "09:00" to minutes from midnight
function timeToMinutes(t) {
  const norm = normalizeTime(t);
  if (!norm) return null;
  const [h, m] = norm.split(':').map(Number);
  return h * 60 + m;
}

// Convert minutes back to "HH:MM"
function minutesToTime(min) {
  if (min == null) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Returns { status: 'open'|'closed'|'outside'|'ok'|'unknown', open, close }
function checkOpen(openingHours, isoDate, startTime, endTime) {
  if (!openingHours) return { status: 'ok' };
  const hours = hoursForDate(openingHours, isoDate);
  if (!hours) return { status: 'unknown' };
  if (hours === 'closed') return { status: 'closed' };
  const [openStr, closeStr] = hours.split('-');
  if (!startTime) return { status: 'open', open: openStr, close: closeStr };
  const startMin = timeToMinutes(startTime);
  const openMin = timeToMinutes(openStr);
  const closeMin = timeToMinutes(closeStr);
  const endMin = endTime ? timeToMinutes(endTime) : null;
  if (startMin == null || openMin == null || closeMin == null) return { status: 'ok' };
  if (startMin < openMin || startMin >= closeMin) return { status: 'outside', open: openStr, close: closeStr };
  if (endMin != null && endMin > closeMin) return { status: 'outside', open: openStr, close: closeStr };
  return { status: 'ok', open: openStr, close: closeStr };
}

// Compact summary like "Mon: 09:00-17:00 · Tue: closed …"
function summarizeHours(openingHours) {
  if (!openingHours) return 'Open anytime';
  const order = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const labels = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
  return order.map(d => {
    const h = openingHours[d];
    if (!h || h === 'closed') return `${labels[d]}: closed`;
    return `${labels[d]}: ${h}`;
  }).join(' · ');
}

// Find earliest free slot of `duration` minutes within opening hours, avoiding occupied intervals.
// existing: array of { start, end } in minutes, may contain nulls; hours: "HH:MM-HH:MM" or "closed".
// Returns { start, end } in minutes, or null if no slot fits.
function findEarliestSlot(hours, duration, existing) {
  if (!hours || hours === 'closed') return null;
  const [openStr, closeStr] = hours.split('-');
  const openMin = timeToMinutes(openStr);
  const closeMin = timeToMinutes(closeStr);
  if (openMin == null || closeMin == null) return null;

  const occupied = (existing || [])
    .filter(x => x && x.start != null && x.end != null)
    .sort((a, b) => a.start - b.start);

  let cursor = openMin;
  for (const slot of occupied) {
    if (slot.end <= cursor) continue;
    if (slot.start - cursor >= duration) {
      return { start: cursor, end: cursor + duration };
    }
    cursor = Math.max(cursor, slot.end);
  }
  if (closeMin - cursor >= duration) {
    return { start: cursor, end: cursor + duration };
  }
  return null;
}

// Two intervals in minutes overlap iff a.start < b.end && b.start < a.end
function intervalsOverlap(a, b) {
  if (!a || !b || a.start == null || a.end == null || b.start == null || b.end == null) return false;
  return a.start < b.end && b.start < a.end;
}

const TIME_SLOTS = [
  { key: 'morning',   label: '🌅 Morning',   start: '08:00', end: '12:00' },
  { key: 'midday',    label: '☀ Midday',     start: '12:00', end: '15:00' },
  { key: 'afternoon', label: '🌤 Afternoon', start: '15:00', end: '18:00' },
  { key: 'evening',   label: '🌆 Evening',   start: '18:00', end: '22:00' },
];

// Does the attraction's opening window for a given date overlap with the slot?
function isOpenInSlot(attraction, isoDate, slot) {
  const hours = hoursForDate(attraction.opening_hours, isoDate);
  if (!hours || hours === 'closed') return false;
  const [openStr, closeStr] = hours.split('-');
  const openMin = timeToMinutes(openStr);
  const closeMin = timeToMinutes(closeStr);
  const slotStart = timeToMinutes(slot.start);
  const slotEnd = timeToMinutes(slot.end);
  if (openMin == null || closeMin == null) return false;
  return openMin < slotEnd && closeMin > slotStart;
}

function TripPlanDetails() {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newActivity, setNewActivity] = useState({});
  const [activityError, setActivityError] = useState('');
  const [budgetForm, setBudgetForm] = useState({ budget_limit: '', flight_cost: '', hotel_cost: '' });
  const [budgetSaving, setBudgetSaving] = useState(false);
  const [budgetMessage, setBudgetMessage] = useState('');
  const [slotByDay, setSlotByDay] = useState({});

  const token = localStorage.getItem('token');

  const syncBudgetForm = (data) => {
    setBudgetForm({
      budget_limit: data.budget_limit ?? '',
      flight_cost: data.flight_cost ?? 0,
      hotel_cost: data.hotel_cost ?? 0,
    });
  };

  const activitiesCost = (plan?.trip_days || []).reduce(
    (sum, day) => sum + (day.activities || []).reduce((s, a) => s + Number(a.cost || 0), 0),
    0
  );
  const flightCost = Number(plan?.flight_cost || 0);
  const hotelCost = Number(plan?.hotel_cost || 0);
  const totalSpent = Math.round((flightCost + hotelCost + activitiesCost) * 100) / 100;
  const budgetLimit = plan?.budget_limit != null ? Number(plan.budget_limit) : null;
  const remaining = budgetLimit != null ? Math.round((budgetLimit - totalSpent) * 100) / 100 : null;
  const progressPct = budgetLimit && budgetLimit > 0 ? Math.min(100, (totalSpent / budgetLimit) * 100) : 0;
  const overBudget = budgetLimit != null && totalSpent > budgetLimit;

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/trip-plans/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setPlan(data);
        syncBudgetForm(data);
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

  const handleAddSuggested = (dayId, attraction, dayDate) => {
    const hours = hoursForDate(attraction.opening_hours, dayDate);
    if (hours === 'closed') {
      setActivityError(`${attraction.name} is closed on this day. Pick another day or another attraction.`);
      return;
    }

    const duration = attraction.duration_minutes || 120;
    const slotKey = slotByDay[dayId];
    const pickedSlot = TIME_SLOTS.find(s => s.key === slotKey);

    let startTime = '';
    let endTime = '';

    if (pickedSlot) {
      // User picked a specific time slot → use it; clamp to attraction hours so start is valid
      const [openStr, closeStr] = hours.split('-');
      const openMin = timeToMinutes(openStr);
      const closeMin = timeToMinutes(closeStr);
      const slotStartMin = timeToMinutes(pickedSlot.start);
      const slotEndMin = timeToMinutes(pickedSlot.end);

      const startMin = Math.max(openMin, slotStartMin);
      const maxEndMin = Math.min(closeMin, slotEndMin);
      if (startMin >= maxEndMin) {
        setActivityError(`${attraction.name} is not open during ${pickedSlot.label} (hours: ${hours}).`);
        return;
      }
      const endMin = Math.min(startMin + duration, maxEndMin);
      startTime = minutesToTime(startMin);
      endTime = minutesToTime(endMin);
      setActivityError('');
    } else {
      // No slot picked → auto-find earliest free slot avoiding existing activities
      const day = plan?.trip_days?.find(d => d.id === dayId);
      const existing = (day?.activities || []).map(a => {
        const s = timeToMinutes(a.start_time);
        const e = timeToMinutes(a.end_time);
        return (s != null && e != null) ? { start: s, end: e } : null;
      });
      const auto = findEarliestSlot(hours, duration, existing);
      if (auto) {
        startTime = minutesToTime(auto.start);
        endTime = minutesToTime(auto.end);
        setActivityError('');
      } else {
        setActivityError(`No free ${duration}-min slot within ${attraction.name}'s opening hours. Pick a time slot manually.`);
        startTime = hours.split('-')[0];
      }
    }

    setNewActivity(prev => ({
      ...prev,
      [dayId]: {
        name: attraction.name,
        type: attraction.type,
        cost: attraction.price_estimate,
        notes: attraction.description,
        start_time: startTime,
        end_time: endTime,
      }
    }));
  };

  const handleBudgetSave = async () => {
    setBudgetSaving(true);
    setBudgetMessage('');
    try {
      const payload = {
        budget_limit: budgetForm.budget_limit === '' ? null : Number(budgetForm.budget_limit),
        flight_cost: budgetForm.flight_cost === '' ? 0 : Number(budgetForm.flight_cost),
        hotel_cost: budgetForm.hotel_cost === '' ? 0 : Number(budgetForm.hotel_cost),
      };
      const response = await fetch(`http://127.0.0.1:8000/api/trip-plans/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to save budget');
      setPlan(prev => ({ ...prev, ...data, trip_days: prev.trip_days }));
      syncBudgetForm({ ...data });
      setBudgetMessage('Budget saved ✓');
      setTimeout(() => setBudgetMessage(''), 2500);
    } catch (err) {
      setBudgetMessage(`✕ ${err.message}`);
    } finally {
      setBudgetSaving(false);
    }
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
            </p>
          </div>
        </header>

        {activityError && <p className="error-message">✕ {activityError}</p>}

        {/* Budget panel (III iteration) */}
        <section className="filter-card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
            <h3 style={{ margin: 0 }}>💶 Budget</h3>
            {budgetMessage && <small style={{ color: 'var(--text-soft)' }}>{budgetMessage}</small>}
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginTop: 12 }}>
            <label className="form-label">
              <span>Total budget (€)</span>
              <input
                className="form-input"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 1500"
                value={budgetForm.budget_limit}
                onChange={e => setBudgetForm(prev => ({ ...prev, budget_limit: e.target.value }))}
              />
            </label>
            <label className="form-label">
              <span>✈ Flight cost (€)</span>
              <input
                className="form-input"
                type="number"
                min="0"
                step="0.01"
                value={budgetForm.flight_cost}
                onChange={e => setBudgetForm(prev => ({ ...prev, flight_cost: e.target.value }))}
              />
            </label>
            <label className="form-label">
              <span>🏨 Hotel cost (€)</span>
              <input
                className="form-input"
                type="number"
                min="0"
                step="0.01"
                value={budgetForm.hotel_cost}
                onChange={e => setBudgetForm(prev => ({ ...prev, hotel_cost: e.target.value }))}
              />
            </label>
            <button className="btn" onClick={handleBudgetSave} disabled={budgetSaving} style={{ alignSelf: 'end' }}>
              {budgetSaving ? 'Saving…' : 'Save budget'}
            </button>
          </div>

          <div className="details-grid" style={{ marginTop: 16 }}>
            <div className="detail-pill">
              <span>Flight</span>
              <strong>€{flightCost.toFixed(2)}</strong>
            </div>
            <div className="detail-pill">
              <span>Hotel</span>
              <strong>€{hotelCost.toFixed(2)}</strong>
            </div>
            <div className="detail-pill">
              <span>Activities</span>
              <strong>€{activitiesCost.toFixed(2)}</strong>
            </div>
            <div className="detail-pill">
              <span>Total spent</span>
              <strong>€{totalSpent.toFixed(2)}</strong>
            </div>
            {budgetLimit != null && (
              <div className="detail-pill">
                <span>{overBudget ? 'Over by' : 'Remaining'}</span>
                <strong style={{ color: overBudget ? '#c0392b' : undefined }}>
                  €{Math.abs(remaining).toFixed(2)}
                </strong>
              </div>
            )}
          </div>

          {budgetLimit != null && budgetLimit > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{
                width: '100%',
                height: 10,
                background: 'rgba(0,0,0,0.08)',
                borderRadius: 999,
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${progressPct}%`,
                  height: '100%',
                  background: overBudget ? '#c0392b' : progressPct > 85 ? '#e67e22' : '#27ae60',
                  transition: 'width 0.3s ease',
                }} />
              </div>
              <small style={{ color: 'var(--text-soft)', display: 'block', marginTop: 6 }}>
                {progressPct.toFixed(0)}% of €{budgetLimit.toFixed(2)} used
              </small>
            </div>
          )}

          {overBudget && (
            <p className="error-message" style={{ marginTop: 12 }}>
              ⚠ You are over budget. Consider reducing costs or raising your budget limit.
            </p>
          )}
          {budgetLimit == null && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)', marginTop: 10 }}>
              Set a total budget to track remaining funds.
            </p>
          )}
        </section>

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
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '8px 0 0' }}>
                        🕒 {summarizeHours(attraction.opening_hours)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="stack">
          {plan.trip_days?.map(day => {
            const weekdayLabel = day.date
              ? new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })
              : '';

            // Sort activities chronologically (untimed at the end)
            const sortedActivities = [...(day.activities || [])].sort((a, b) => {
              const sa = timeToMinutes(a.start_time);
              const sb = timeToMinutes(b.start_time);
              if (sa == null && sb == null) return 0;
              if (sa == null) return 1;
              if (sb == null) return -1;
              return sa - sb;
            });

            // Overlap detection: mark any activity overlapping another
            const intervals = sortedActivities.map(a => {
              const s = timeToMinutes(a.start_time);
              const e = timeToMinutes(a.end_time);
              return (s != null && e != null) ? { id: a.id, start: s, end: e } : null;
            });
            const overlappingIds = new Set();
            for (let i = 0; i < intervals.length; i++) {
              for (let j = i + 1; j < intervals.length; j++) {
                if (intervalsOverlap(intervals[i], intervals[j])) {
                  overlappingIds.add(intervals[i].id);
                  overlappingIds.add(intervals[j].id);
                }
              }
            }

            return (
            <div key={day.id} className="detail-card">
              <h2 className="card-heading">Day {day.day_number} — {day.date} <span style={{ fontSize: '0.85rem', color: 'var(--text-soft)', fontWeight: 500 }}>({weekdayLabel})</span></h2>

              {/* Timeline strip */}
              {sortedActivities.some(a => timeToMinutes(a.start_time) != null && timeToMinutes(a.end_time) != null) && (
                <div style={{ marginTop: 12, marginBottom: 20 }}>
                  <div style={{ position: 'relative', height: 30, background: 'rgba(0,0,0,0.04)', borderRadius: 6, overflow: 'hidden' }}>
                    {sortedActivities.map(a => {
                      const s = timeToMinutes(a.start_time);
                      const e = timeToMinutes(a.end_time);
                      if (s == null || e == null) return null;
                      // Timeline spans 06:00 (360) to 24:00 (1440) = 1080 min
                      const TL_START = 360, TL_END = 1440, TL_SPAN = TL_END - TL_START;
                      const left = Math.max(0, ((s - TL_START) / TL_SPAN) * 100);
                      const width = Math.max(1, ((Math.min(e, TL_END) - Math.max(s, TL_START)) / TL_SPAN) * 100);
                      const isOverlap = overlappingIds.has(a.id);
                      return (
                        <div
                          key={a.id}
                          title={`${a.name} (${normalizeTime(a.start_time)}–${normalizeTime(a.end_time)})`}
                          style={{
                            position: 'absolute',
                            top: 4, bottom: 4,
                            left: `${left}%`, width: `${width}%`,
                            background: isOverlap ? '#c0392b' : 'var(--accent, #5b7cff)',
                            opacity: 0.85,
                            borderRadius: 4,
                            color: '#fff',
                            fontSize: '0.68rem',
                            padding: '0 4px',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            lineHeight: '22px',
                          }}
                        >
                          {a.name}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    <span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
                  </div>
                </div>
              )}

              {sortedActivities.length > 0 && (
                <div className="stack" style={{ marginTop: 16, marginBottom: 20 }}>
                  {sortedActivities.map(activity => {
                    const matchedAttraction = attractions.find(a => a.name === activity.name);
                    const check = matchedAttraction
                      ? checkOpen(matchedAttraction.opening_hours, day.date, activity.start_time, activity.end_time)
                      : { status: 'ok' };
                    const isOverlap = overlappingIds.has(activity.id);
                    const startN = normalizeTime(activity.start_time);
                    const endN = normalizeTime(activity.end_time);
                    return (
                    <div key={activity.id} className="profile-bar">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                        <div className="attraction-icon" aria-hidden="true" style={{ width: 36, height: 36, fontSize: '1.2rem' }}>
                          {iconForType(activity.type)}
                        </div>
                        <div className="profile-meta">
                          <strong>{activity.name}</strong>
                          <small>
                            {activity.type && `${activity.type} · `}
                            {startN && endN && `${startN}–${endN} · `}
                            {startN && !endN && `${startN} · `}
                            {activity.cost > 0 && `€${activity.cost}`}
                          </small>
                          {activity.notes && <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)' }}>{activity.notes}</p>}
                          {check.status === 'closed' && (
                            <p style={{ fontSize: '0.8rem', color: '#c0392b', margin: '4px 0 0' }}>
                              ⚠ This place is closed on {weekdayLabel}.
                            </p>
                          )}
                          {check.status === 'outside' && (
                            <p style={{ fontSize: '0.8rem', color: '#e67e22', margin: '4px 0 0' }}>
                              ⚠ Outside opening hours ({check.open}–{check.close}).
                            </p>
                          )}
                          {isOverlap && (
                            <p style={{ fontSize: '0.8rem', color: '#c0392b', margin: '4px 0 0' }}>
                              ⚠ Overlaps with another activity on this day.
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        className="btn-ghost"
                        onClick={() => handleDeleteActivity(day.id, activity.id)}
                      >
                        Remove
                      </button>
                    </div>
                    );
                  })}
                </div>
              )}

              {day.activities?.length === 0 && (
                <div className="empty-state" style={{ marginTop: 12, marginBottom: 16 }}>
                  <span className="empty-state-icon">📍</span>
                  No activities yet.
                </div>
              )}

              <hr className="card-divider" />

              {/* Time-slot picker */}
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pick a time slot</p>
                <div className="option-chips">
                  {TIME_SLOTS.map(slot => {
                    const active = slotByDay[day.id] === slot.key;
                    return (
                      <button
                        key={slot.key}
                        className="option-chip"
                        onClick={() => setSlotByDay(prev => ({
                          ...prev,
                          [day.id]: prev[day.id] === slot.key ? null : slot.key,
                        }))}
                        style={active ? { background: 'var(--accent, #5b7cff)', color: '#fff', borderColor: 'transparent' } : undefined}
                      >
                        {slot.label} <span style={{ fontSize: '0.75rem', marginLeft: 4, opacity: 0.8 }}>{slot.start}–{slot.end}</span>
                      </button>
                    );
                  })}
                </div>
                {slotByDay[day.id] && (
                  <small style={{ color: 'var(--text-soft)', display: 'block', marginTop: 6 }}>
                    Suggestions below are filtered to attractions open during this slot. Click one to schedule it.
                  </small>
                )}
              </div>

              {/* Greitas pridėjimas iš pasiūlymų */}
              {attractions.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {slotByDay[day.id] ? 'Open during this slot' : 'Quick add from suggestions'}
                  </p>
                  <div className="option-chips">
                    {attractions.map(attraction => {
                      const hoursToday = hoursForDate(attraction.opening_hours, day.date);
                      const isClosedToday = hoursToday === 'closed';
                      const slotKey = slotByDay[day.id];
                      const pickedSlot = TIME_SLOTS.find(s => s.key === slotKey);
                      const openInSlot = pickedSlot ? isOpenInSlot(attraction, day.date, pickedSlot) : true;
                      const disabled = isClosedToday || (pickedSlot && !openInSlot);

                      const statusIcon = pickedSlot
                        ? (openInSlot ? '✓' : '✕')
                        : null;
                      const hoursLabel = isClosedToday ? 'closed today' : hoursToday;

                      return (
                      <button
                        key={attraction.id}
                        className="option-chip"
                        disabled={disabled}
                        style={disabled ? { opacity: 0.45, cursor: 'not-allowed' } : undefined}
                        onClick={() => handleAddSuggested(day.id, attraction, day.date)}
                        title={disabled ? `Not available during the selected slot (hours: ${hoursLabel})` : hoursLabel}
                      >
                        <span aria-hidden="true" style={{ marginRight: 6 }}>{iconForType(attraction.type)}</span>
                        {attraction.name} {attraction.price_estimate > 0 ? `€${attraction.price_estimate}` : '(free)'}
                        {statusIcon && (
                          <span style={{ marginLeft: 6, fontWeight: 700, color: openInSlot ? '#27ae60' : '#c0392b' }}>
                            {statusIcon}
                          </span>
                        )}
                        <span style={{ marginLeft: 6, fontSize: '0.75rem', color: isClosedToday ? '#c0392b' : 'var(--text-muted)' }}>
                          🕒 {hoursLabel}
                        </span>
                      </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
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
                  placeholder="Start"
                  value={newActivity[day.id]?.start_time || ''}
                  onChange={e => setNewActivity(prev => ({ ...prev, [day.id]: { ...prev[day.id], start_time: e.target.value } }))}
                />
                <input
                  className="form-input"
                  type="time"
                  placeholder="End"
                  value={newActivity[day.id]?.end_time || ''}
                  onChange={e => setNewActivity(prev => ({ ...prev, [day.id]: { ...prev[day.id], end_time: e.target.value } }))}
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
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <button className="btn" onClick={() => handleAddActivity(day.id)}>
                  + Add activity
                </button>
              </div>
            </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default TripPlanDetails;