import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      const response = await fetch('http://127.0.0.1:8000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setMessage('Registration successful');
      setTimeout(() => navigate('/'), 500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app-shell auth-page">
      <div className="auth-layout">

        <section className="hero-panel">
          <span className="eyebrow">✦ New account</span>
          <h1 className="hero-title">Start planning<br />in minutes.</h1>
          <p className="hero-text">
            Register once, browse destinations, and get tailored travel
            recommendations based on your preferences.
          </p>
          <div className="hero-stats">
            <div className="stat-box">
              <span className="stat-value">1</span>
              <span className="stat-label">Account for all destinations</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">4</span>
              <span className="stat-label">Preference filters</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">Top 3</span>
              <span className="stat-label">Recommendations</span>
            </div>
          </div>
        </section>

        <section className="content-card">
          <div className="card-header">
            <h2 className="card-title">Create account</h2>
            <p className="card-text">Fill in your details to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full name</label>
              <input
                id="name"
                className="form-input"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email address</label>
              <input
                id="email"
                className="form-input"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                className="form-input"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a secure password"
              />
            </div>
            <div className="button-row">
              <button className="btn" type="submit">Create account →</button>
            </div>
          </form>

          {message && <p className="status-message">✓ {message}</p>}
          {error && <p className="error-message">✕ {error}</p>}

          <p className="footer-note">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </section>

      </div>
    </div>
  );
}

export default Register;
