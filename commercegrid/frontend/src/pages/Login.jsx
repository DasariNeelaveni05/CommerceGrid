import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, register } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = isLogin
        ? await login({ email: form.email, password: form.password })
        : await register(form);
      loginUser(res.data.token, res.data.user);
      navigate(res.data.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '40px', width: '100%', maxWidth: '440px', boxShadow: 'var(--shadow-xl)' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--dark)' }}>
              Commerce<span style={{ color: 'var(--primary-light)' }}>Grid</span>
            </span>
          </Link>
          <p style={{ color: 'var(--gray)', fontSize: '0.875rem', marginTop: '6px' }}>
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderRadius: 'var(--radius)', background: 'var(--bg-2)', padding: '4px', marginBottom: '24px' }}>
          {['Sign In', 'Register'].map((tab, i) => (
            <button
              key={tab}
              onClick={() => { setIsLogin(i === 0); setError(''); }}
              style={{
                flex: 1, padding: '8px', borderRadius: 'var(--radius-sm)',
                border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
                background: (i === 0) === isLogin ? 'white' : 'transparent',
                color: (i === 0) === isLogin ? 'var(--primary)' : 'var(--gray)',
                boxShadow: (i === 0) === isLogin ? 'var(--shadow-sm)' : 'none',
                transition: 'all var(--transition)',
              }}
            >{tab}</button>
          ))}
        </div>

        {error && <div className="alert alert-error mb-4">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLogin && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input id="firstName" className="form-input" placeholder="John" value={form.firstName} onChange={(e) => setForm(f => ({...f, firstName: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input id="lastName" className="form-input" placeholder="Doe" value={form.lastName} onChange={(e) => setForm(f => ({...f, lastName: e.target.value}))} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input id="email" type="email" className="form-input" placeholder="you@example.com" required value={form.email} onChange={(e) => setForm(f => ({...f, email: e.target.value}))} />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="password" type="password" className="form-input" placeholder={isLogin ? '••••••••' : 'Min 6 characters'} required minLength={6} value={form.password} onChange={(e) => setForm(f => ({...f, password: e.target.value}))} />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '4px' }} disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? 'Sign In →' : 'Create Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.82rem', color: 'var(--gray)' }}>
          <Link to="/" style={{ color: 'var(--primary-light)' }}>← Back to Home</Link>
        </p>
      </div>
    </main>
  );
}
