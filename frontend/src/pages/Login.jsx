import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
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
      const response = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setMessage('Login successful');
      setTimeout(() => navigate('/'), 500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app-shell auth-page">
      <div className="auth-layout">

        <section className="hero-panel">
        <span className="eyebrow">✦ Travel Planning</span>
        <h1 className="hero-title">Your journey starts here</h1>
        <p className="hero-text">
          Plan your perfect trip — discover destinations, build day-by-day itineraries and track your budget.
        </p>
        <div className="button-row" style={{ justifyContent: 'center' }}>
          <Link to="/" className="btn-secondary">Browse destinations →</Link>
        </div>
      </section>

        <section className="content-card">
          <div className="card-header">
            <h2 className="card-title">Welcome back</h2>
            <p className="card-text">Enter your credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="form-grid">
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
                placeholder="Enter your password"
              />
            </div>
            <div className="button-row">
              <button className="btn" type="submit">Login →</button>
            </div>
          </form>

          {message && <p className="status-message">✓ {message}</p>}
          {error && <p className="error-message">✕ {error}</p>}

          <p className="footer-note">
            No account yet? <Link to="/register">Create one here</Link>
          </p>
        </section>

      </div>
    </div>
  );
}

export default Login;
