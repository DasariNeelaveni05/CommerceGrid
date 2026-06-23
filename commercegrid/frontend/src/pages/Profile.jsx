import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, updateProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, loginUser } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    addressStreet: '',
    addressCity: '',
    addressState: '',
    addressPincode: '',
    addressCountry: 'India'
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    document.title = 'My Profile — CommerceGrid';
    getMe()
      .then((res) => {
        const u = res.data.user;
        setForm({
          firstName: u.firstName || '',
          lastName: u.lastName || '',
          phone: u.phone || '',
          bio: u.bio || '',
          addressStreet: u.addressStreet || '',
          addressCity: u.addressCity || '',
          addressState: u.addressState || '',
          addressPincode: u.addressPincode || '',
          addressCountry: u.addressCountry || 'India',
        });
      })
      .catch(() => setMessage({ type: 'error', text: 'Failed to load profile details.' }))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await updateProfile(form);
      const token = localStorage.getItem('cg_token');
      loginUser(token, res.data.user);
      setMessage({ type: 'success', text: 'Profile and address updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <main style={{ minHeight: '80vh', padding: '40px 20px', background: '#f8fafc' }}>
      <div className="container" style={{ maxWidth: '720px' }}>
        <div className="card" style={{ padding: '32px', border: '1px solid #e2e8f0', borderRadius: '12px', background: 'white' }}>
          <h1 style={{ marginBottom: '8px', fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>My Profile</h1>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>View and update your personal details and delivery addresses.</p>

          {message.text && (
            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '20px' }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* Section: Personal Info */}
            <div>
              <h3 style={{ fontSize: '1.15rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px', marginBottom: '16px', color: 'var(--primary)' }}>
                👤 Personal Information
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    id="firstName"
                    className="form-input"
                    value={form.firstName}
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                    placeholder="e.g. John"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    id="lastName"
                    className="form-input"
                    value={form.lastName}
                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                    placeholder="e.g. Doe"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Email Address (readonly)</label>
                  <input
                    className="form-input"
                    type="email"
                    value={user?.email}
                    disabled
                    style={{ background: '#f1f5f9', cursor: 'not-allowed' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input
                    id="phone"
                    className="form-input"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="e.g. +91 9876543210"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea
                  id="bio"
                  className="form-input"
                  rows="3"
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  placeholder="Write something about yourself..."
                />
              </div>
            </div>

            {/* Section: Shipping Address */}
            <div>
              <h3 style={{ fontSize: '1.15rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px', marginBottom: '16px', color: 'var(--primary)' }}>
                📍 Shipping & Delivery Address
              </h3>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Street Address</label>
                <input
                  id="addressStreet"
                  className="form-input"
                  value={form.addressStreet}
                  onChange={(e) => setForm((f) => ({ ...f, addressStreet: e.target.value }))}
                  placeholder="e.g. Flat 402, Building A, Tech Park Road"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    id="addressCity"
                    className="form-input"
                    value={form.addressCity}
                    onChange={(e) => setForm((f) => ({ ...f, addressCity: e.target.value }))}
                    placeholder="e.g. Mumbai"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    id="addressState"
                    className="form-input"
                    value={form.addressState}
                    onChange={(e) => setForm((f) => ({ ...f, addressState: e.target.value }))}
                    placeholder="e.g. Maharashtra"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">PIN Code</label>
                  <input
                    id="addressPincode"
                    className="form-input"
                    value={form.addressPincode}
                    onChange={(e) => setForm((f) => ({ ...f, addressPincode: e.target.value }))}
                    placeholder="e.g. 400001"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input
                    id="addressCountry"
                    className="form-input"
                    value={form.addressCountry}
                    onChange={(e) => setForm((f) => ({ ...f, addressCountry: e.target.value }))}
                    placeholder="e.g. India"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '10px' }} disabled={submitting}>
              {submitting ? 'Saving Changes...' : 'Save Profile & Address Details'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
