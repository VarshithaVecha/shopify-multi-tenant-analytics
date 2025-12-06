import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopifyStore, setShopifyStore] = useState('');
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { email, password, shopifyStore });
      alert('Registration successful! Please login.');
      nav('/login');
    } catch (err) {
      console.error(err.response?.data);
      alert(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="container mt-5 text-white">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="glass-card p-4 shadow-sm" style={{ borderRadius: "12px",marginTop: "10em"  }}>
            <h4 className="mb-3">Register</h4>
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                className="form-control mb-2 glass-input"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                className="form-control mb-2 glass-input"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <input
                type="text"
                className="form-control mb-3 glass-input"
                placeholder="Shopify Store Name"
                value={shopifyStore}
                onChange={e => setShopifyStore(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary w-100">Register</button>
              <Link to="/login" className="btn btn-outline-secondary w-100 mt-2 text-white">
                Back to Login
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
