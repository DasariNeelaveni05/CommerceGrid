import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProducts, getCategories } from '../services/api';
import ProductCard from '../components/ProductCard';
import './Home.css';

const STATS = [
  { icon: '📦', value: '10,000+', label: 'Products Listed' },
  { icon: '🏷️', value: '50+', label: 'Brands Available' },
  { icon: '⭐', value: '4.8/5', label: 'Average Rating' },
  { icon: '🚀', value: '99.9%', label: 'Uptime SLA' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newest, setNewest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'CommerceGrid — Scalable E-Commerce Product Catalog';

    const fetchData = async () => {
      try {
        const [featRes, catRes, newRes] = await Promise.all([
          getProducts({ featured: 'true', limit: 8 }),
          getCategories(),
          getProducts({ sort: 'newest', limit: 8 }),
        ]);
        setFeatured(featRes.data.data || []);
        setCategories(catRes.data.data || []);
        setNewest(newRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <main className="home">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero__bg-grid" aria-hidden="true" />
        <div className="hero__bg-glow hero__bg-glow--1" aria-hidden="true" />
        <div className="hero__bg-glow hero__bg-glow--2" aria-hidden="true" />
        <div className="container hero__content">
          <div className="hero__text animate-in">
            <div className="hero__eyebrow">
              <span className="hero__dot" />
              Enterprise Product Catalog Platform
            </div>
            <h1 className="hero__title">
              Discover Every Product
              <span className="hero__title-accent"> Instantly</span>
            </h1>
            <p className="hero__subtitle">
              A scalable, modern e-commerce catalog with advanced search, smart filtering,
              and real-time inventory — built with React, Node.js, and MongoDB.
            </p>
            <form onSubmit={handleHeroSearch} className="hero__search">
              <input
                id="hero-search"
                className="hero__search-input"
                type="text"
                placeholder="Search products, brands, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="hero__search-btn btn btn-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                Search
              </button>
            </form>
            <div className="hero__tags">
              {['Mobiles', 'Laptops', 'Electronics', 'Fashion', 'Gaming', 'Books'].map((t) => (
                <Link key={t} to={`/products?category=${t.toLowerCase()}`} className="hero__tag">
                  {t}
                </Link>
              ))}
            </div>
          </div>
          <div className="hero__visual animate-in">
            <div className="hero__card-stack">
              {[
                { icon: '📱', name: 'iPhone 15 Pro', price: '₹1,34,900', rating: '4.9' },
                { icon: '💻', name: 'MacBook Pro M3', price: '₹1,98,900', rating: '4.8' },
                { icon: '🎮', name: 'PlayStation 5', price: '₹49,990', rating: '4.7' },
              ].map((item, i) => (
                <div key={i} className={`hero__mini-card hero__mini-card--${i}`}>
                  <span className="hero__mini-icon">{item.icon}</span>
                  <div>
                    <div className="hero__mini-name">{item.name}</div>
                    <div className="hero__mini-price">{item.price}</div>
                  </div>
                  <div className="hero__mini-rating">⭐ {item.rating}</div>
                </div>
              ))}
              <div className="hero__grid-pattern" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <section className="home-stats">
        <div className="container">
          <div className="stats-grid">
            {STATS.map((s) => (
              <div key={s.label} className="stat-card">
                <div className="stat-card__icon">{s.icon}</div>
                <div className="stat-card__value">{s.value}</div>
                <div className="stat-card__label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────── */}
      <section className="section home-categories">
        <div className="container">
          <div className="section-header">
            <span className="section-header__subtitle">Browse By</span>
            <h2 className="section-header__title">Shop by Category</h2>
            <p className="section-header__desc">
              From cutting-edge electronics to everyday essentials
            </p>
          </div>
          <div className="categories-grid">
            {categories.slice(0, 10).map((cat) => (
              <Link key={cat.id || cat._id} to={`/products?category=${cat.slug}`} className="cat-card">
                <div className="cat-card__icon-wrap" style={{ background: cat.color + '18', borderColor: cat.color + '30' }}>
                  <span className="cat-card__icon">{cat.icon}</span>
                </div>
                <span className="cat-card__name">{cat.name}</span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/categories" className="btn btn-secondary">View All Categories →</Link>
          </div>
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────── */}
      <section className="section home-products">
        <div className="container">
          <div className="section-header flex-between">
            <div>
              <span className="section-header__subtitle">⭐ Hand Picked</span>
              <h2 className="section-header__title">Featured Products</h2>
            </div>
            <Link to="/products?featured=true" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          {loading ? (
            <div className="loader"><div className="spinner" /></div>
          ) : featured.length > 0 ? (
            <div className="products-grid">
              {featured.map((p) => <ProductCard key={p.id || p._id} product={p} />)}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state__icon">🛍️</div>
              <div className="empty-state__title">No featured products yet</div>
              <div className="empty-state__desc">Check back soon!</div>
            </div>
          )}
        </div>
      </section>

      {/* ── Banner CTA ────────────────────────────────────────── */}
      <section className="home-banner">
        <div className="container home-banner__inner">
          <div>
            <h2 className="home-banner__title">Ready to Explore the Catalog?</h2>
            <p className="home-banner__sub">
              Advanced filters • Real-time search • 10,000+ products
            </p>
          </div>
          <Link to="/products" className="btn btn-primary btn-lg">
            Browse All Products →
          </Link>
        </div>
      </section>

      {/* ── New Arrivals ──────────────────────────────────────── */}
      <section className="section home-products">
        <div className="container">
          <div className="section-header flex-between">
            <div>
              <span className="section-header__subtitle">🆕 Just In</span>
              <h2 className="section-header__title">New Arrivals</h2>
            </div>
            <Link to="/products?sort=newest" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          {!loading && newest.length > 0 && (
            <div className="products-grid">
              {newest.map((p) => <ProductCard key={p.id || p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="home-footer">
        <div className="container home-footer__inner">
          <div>
            <div className="navbar__logo-text" style={{ fontSize: '1.3rem' }}>
              Commerce<span style={{ color: 'var(--primary-light)' }}>Grid</span>
            </div>
            <p className="home-footer__tagline">Scalable E-Commerce Product Catalog Platform</p>
          </div>
          <div className="home-footer__links">
            <Link to="/products">Products</Link>
            <Link to="/categories">Categories</Link>
            <Link to="/admin">Admin</Link>
          </div>
          <p className="home-footer__copy">© 2024 CommerceGrid. Built with React + Node.js + MongoDB.</p>
        </div>
      </footer>
    </main>
  );
}
