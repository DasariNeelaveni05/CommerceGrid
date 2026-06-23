import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProductStats } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Admin Dashboard — CommerceGrid';
    if (!isAdmin) { navigate('/login'); return; }
    getProductStats()
      .then((r) => setStats(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAdmin]);

  if (!isAdmin) return null;

  const STAT_CARDS = stats ? [
    { icon: '📦', label: 'Total Products', value: stats.totalProducts?.toLocaleString(), color: '#3B82F6', bg: '#EFF6FF' },
    { icon: '🗂️', label: 'Categories', value: stats.totalCategories?.toLocaleString(), color: '#10B981', bg: '#ECFDF5' },
    { icon: '👤', label: 'Total Users', value: stats.totalUsers?.toLocaleString(), color: '#8B5CF6', bg: '#F5F3FF' },
    { icon: '⭐', label: 'Featured', value: stats.featuredCount?.toLocaleString(), color: '#F59E0B', bg: '#FFFBEB' },
  ] : [];

  const QUICK_ACTIONS = [
    { to: '/admin/products', icon: '➕', label: 'Add Product', desc: 'Create a new product listing', color: 'var(--primary)' },
    { to: '/admin/products', icon: '✏️', label: 'Manage Products', desc: 'Edit or delete products', color: '#10B981' },
    { to: '/admin/categories', icon: '🗂️', label: 'Manage Categories', desc: 'Add or edit categories', color: '#8B5CF6' },
    { to: '/products', icon: '🛍️', label: 'View Catalog', desc: 'Browse the product catalog', color: '#F59E0B' },
  ];

  return (
    <main className="admin-page">
      <div className="container">
        {/* Header */}
        <div className="admin-header">
          <div>
            <h1 className="admin-header__title">Admin Dashboard</h1>
            <p className="admin-header__sub">Welcome back, {user?.firstName || 'Admin'} 👋</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/admin/products" className="btn btn-primary">+ Add Product</Link>
            <Link to="/admin/categories" className="btn btn-secondary">Manage Categories</Link>
          </div>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="loader"><div className="spinner" /></div>
        ) : (
          <div className="admin-stats">
            {STAT_CARDS.map((s) => (
              <div key={s.label} className="admin-stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
                <div className="admin-stat-card__icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                <div className="admin-stat-card__value">{s.value}</div>
                <div className="admin-stat-card__label">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="admin-section">
          <h2 className="admin-section__title">Quick Actions</h2>
          <div className="quick-actions-grid">
            {QUICK_ACTIONS.map((a) => (
              <Link key={a.to + a.label} to={a.to} className="quick-action-card">
                <div className="quick-action-card__icon" style={{ color: a.color }}>{a.icon}</div>
                <div className="quick-action-card__label">{a.label}</div>
                <div className="quick-action-card__desc">{a.desc}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Top Categories */}
        {stats?.topCategories?.length > 0 && (
          <div className="admin-section">
            <h2 className="admin-section__title">Top Categories by Products</h2>
            <div className="top-cats">
              {stats.topCategories.map((c, i) => (
                <div key={c.id || c.name} className="top-cat-row">
                  <span className="top-cat-row__rank">#{i + 1}</span>
                  <span className="top-cat-row__icon">{c.icon}</span>
                  <span className="top-cat-row__name">{c.name}</span>
                  <div className="top-cat-row__bar-wrap">
                    <div
                      className="top-cat-row__bar"
                      style={{ width: `${(c.count / stats.topCategories[0].count) * 100}%` }}
                    />
                  </div>
                  <span className="top-cat-row__count">{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
