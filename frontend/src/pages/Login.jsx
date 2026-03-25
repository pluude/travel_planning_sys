import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setMessage('Login successful');

      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '24px' }}>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px', textAlign: 'left' }}>
          <label>Email</label>
          <br />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '12px', textAlign: 'left' }}>
          <label>Password</label>
          <br />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <button type="submit">Login</button>
      </form>

      {message && <p><strong>{message}</strong></p>}
      {error && <p><strong>Error:</strong> {error}</p>}

      <p style={{ marginTop: '16px' }}>
        No account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

export default Login;