import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { searchProducts } from '../services/api';
import './Navbar.css';

export default function Navbar() {
  const { user, logoutUser, isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSugg, setShowSugg] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (search.trim().length >= 2) {
        try {
          const res = await searchProducts(search.trim());
          setSuggestions(res.data.data || []);
          setShowSugg(true);
        } catch {
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
        setShowSugg(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [search]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSugg(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?q=${encodeURIComponent(search.trim())}`);
      setShowSugg(false);
    }
  };

  const getImage = (p) => p.images?.find((i) => i.isPrimary)?.url || p.images?.[0]?.url || '';

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <div className="navbar__logo-icon">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="url(#logoGrad)"/>
              <path d="M8 12h4v12H8V12zm6-4h4v16h-4V8zm6 6h4v10h-4V14z" fill="white" opacity="0.9"/>
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#2563EB"/>
                  <stop offset="1" stopColor="#1E3A8A"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="navbar__logo-text">
            Commerce<span>Grid</span>
          </span>
        </Link>

        {/* Search */}
        <div className="navbar__search" ref={searchRef}>
          <form onSubmit={handleSearch} className="navbar__search-form">
            <svg className="navbar__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              className="navbar__search-input"
              type="text"
              placeholder="Search products, brands, categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSugg(true)}
            />
            <button type="submit" className="navbar__search-btn">Search</button>
          </form>

          {showSugg && suggestions.length > 0 && (
            <div className="navbar__suggestions fade-in">
              {suggestions.map((p) => (
                <Link
                  key={p.id}
                  to={`/products/${p.slug || p.id}`}
                  className="navbar__sugg-item"
                  onClick={() => { setShowSugg(false); setSearch(''); }}
                >
                  <div className="navbar__sugg-img">
                    {getImage(p) ? (
                      <img src={getImage(p)} alt={p.title} />
                    ) : (
                      <span>🛍️</span>
                    )}
                  </div>
                  <div className="navbar__sugg-info">
                    <span className="navbar__sugg-title">{p.title}</span>
                    <span className="navbar__sugg-price">₹{Number(p.price).toLocaleString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Nav Links */}
        <nav className={`navbar__nav${menuOpen ? ' navbar__nav--open' : ''}`}>
          <Link to="/" className="navbar__link">Home</Link>
          <Link to="/products" className="navbar__link">Products</Link>
          <Link to="/categories" className="navbar__link">Categories</Link>
          {user && <Link to="/cart" className="navbar__link">Cart 🛒</Link>}
          {user && <Link to="/orders" className="navbar__link">My Orders</Link>}
          {user && <Link to="/profile" className="navbar__link">Profile 👤</Link>}
          {isAdmin && <Link to="/admin" className="navbar__link navbar__link--admin">Admin</Link>}
          {user ? (
            <div className="navbar__user">
              <div className="navbar__avatar">{user.firstName?.[0] || user.email[0].toUpperCase()}</div>
              <span className="navbar__username">{user.firstName || user.email.split('@')[0]}</span>
              <button onClick={logoutUser} className="btn btn-sm btn-ghost">Logout</button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">Sign In</Link>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span/><span/><span/>
        </button>
      </div>
    </header>
  );
}
