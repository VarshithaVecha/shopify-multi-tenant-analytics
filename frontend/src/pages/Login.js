import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem("tenantId", res.data.tenantId);
      window.location.href = `/dashboard/${res.data.tenantId}`;
    } catch (err) {
      console.error(err);
      alert('Login failed! Check email/password.');
    }
  };
  return (
    <div className="container mt-5 text-white">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="glass-card p-4 shadow-sm" style={{ borderRadius: "12px",  marginTop: "10em" }}>
            <h4 className="mb-3 ">Login</h4>
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                className="form-control glass-input mb-2"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                className="form-control glass-input mb-3"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary w-100 mb-2 text-white">Login</button>
              <Link to="/register" className="btn btn-outline-secondary w-100 text-white">
                Register
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
