import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getProducts, getCategories } from '../services/api';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import './Products.css';

const CONDITIONS = [
  { value: 'new', label: 'Brand New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: '🆕 Newest First' },
  { value: 'price_asc', label: '💲 Price: Low to High' },
  { value: 'price_desc', label: '💲 Price: High to Low' },
  { value: 'rating', label: '⭐ Top Rated' },
  { value: 'popular', label: '🔥 Most Popular' },
  { value: 'featured', label: '🌟 Featured' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filter state from URL
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const condition = searchParams.get('condition') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minRating = searchParams.get('minRating') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const featured = searchParams.get('featured') || '';

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  const clearFilters = () => {
    const next = new URLSearchParams();
    if (q) next.set('q', q);
    setSearchParams(next);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProducts({
        q, category, condition, sort,
        minPrice, maxPrice, minRating, page,
        limit: 20, featured,
      });
      setProducts(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [q, category, condition, sort, minPrice, maxPrice, minRating, page, featured]);

  useEffect(() => {
    document.title = q
      ? `Search: "${q}" — CommerceGrid`
      : 'All Products — CommerceGrid';
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    getCategories().then((r) => setCategories(r.data.data || [])).catch(() => {});
  }, []);

  const hasFilters = category || condition || minPrice || maxPrice || minRating;

  return (
    <div className="products-page">
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <div className="products-topbar">
        <div className="container products-topbar__inner">
          <div className="products-topbar__left">
            <h1 className="products-topbar__title">
              {q ? `Results for "${q}"` : featured ? 'Featured Products' : 'All Products'}
            </h1>
            {pagination.total !== undefined && (
              <span className="products-topbar__count">
                {pagination.total.toLocaleString()} products
              </span>
            )}
          </div>
          <div className="products-topbar__right">
            <button
              className="btn btn-secondary btn-sm filter-toggle-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ⚙ Filters {hasFilters && <span className="filter-badge" />}
            </button>
            <select
              id="sort-select"
              className="form-input form-select sort-select"
              value={sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="container">
        <div className={`page-layout${sidebarOpen ? ' sidebar-open' : ''}`}>
          {/* ── Sidebar Filters ──────────────────────────────── */}
          <aside className="filter-sidebar">
            <div className="filter-sidebar__header">
              <h3>Filters</h3>
              {hasFilters && (
                <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                  Clear All
                </button>
              )}
            </div>

            {/* Category */}
            <div className="filter-group">
              <h4 className="filter-group__title">Category</h4>
              <div className="filter-group__options">
                <label className={`filter-option${!category ? ' filter-option--active' : ''}`}>
                  <input type="radio" checked={!category} onChange={() => updateFilter('category', '')} />
                  All Categories
                </label>
                {categories.map((cat) => (
                  <label
                    key={cat.id || cat._id}
                    className={`filter-option${category === cat.slug ? ' filter-option--active' : ''}`}
                  >
                    <input
                      type="radio"
                      checked={category === cat.slug}
                      onChange={() => updateFilter('category', cat.slug)}
                    />
                    {cat.icon} {cat.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="filter-group">
              <h4 className="filter-group__title">Price Range</h4>
              <div className="filter-price">
                <input
                  className="form-input"
                  type="number"
                  placeholder="Min ₹"
                  value={minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  min="0"
                />
                <span className="filter-price__sep">–</span>
                <input
                  className="form-input"
                  type="number"
                  placeholder="Max ₹"
                  value={maxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  min="0"
                />
              </div>
              <div className="filter-quick-prices">
                {[
                  { label: 'Under ₹1K', max: '1000' },
                  { label: '₹1K–₹10K', min: '1000', max: '10000' },
                  { label: '₹10K–₹50K', min: '10000', max: '50000' },
                  { label: 'Above ₹50K', min: '50000' },
                ].map((r) => (
                  <button
                    key={r.label}
                    className="filter-quick-price-btn"
                    onClick={() => {
                      const next = new URLSearchParams(searchParams);
                      if (r.min) next.set('minPrice', r.min); else next.delete('minPrice');
                      if (r.max) next.set('maxPrice', r.max); else next.delete('maxPrice');
                      next.set('page', '1');
                      setSearchParams(next);
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div className="filter-group">
              <h4 className="filter-group__title">Condition</h4>
              <div className="filter-group__options">
                <label className={`filter-option${!condition ? ' filter-option--active' : ''}`}>
                  <input type="radio" checked={!condition} onChange={() => updateFilter('condition', '')} />
                  Any Condition
                </label>
                {CONDITIONS.map((c) => (
                  <label
                    key={c.value}
                    className={`filter-option${condition === c.value ? ' filter-option--active' : ''}`}
                  >
                    <input
                      type="radio"
                      checked={condition === c.value}
                      onChange={() => updateFilter('condition', c.value)}
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className="filter-group">
              <h4 className="filter-group__title">Min. Rating</h4>
              <div className="filter-group__options">
                {['', '4', '3', '2'].map((r) => (
                  <label
                    key={r}
                    className={`filter-option${minRating === r ? ' filter-option--active' : ''}`}
                  >
                    <input
                      type="radio"
                      checked={minRating === r}
                      onChange={() => updateFilter('minRating', r)}
                    />
                    {r ? `${r}★ & above` : 'Any Rating'}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* ── Products Grid ─────────────────────────────────── */}
          <div className="products-content">
            {loading ? (
              <div className="loader"><div className="spinner" /></div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">🔍</div>
                <div className="empty-state__title">No products found</div>
                <div className="empty-state__desc">Try adjusting your filters or search term</div>
                <button className="btn btn-primary mt-4" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {products.map((p) => <ProductCard key={p.id || p._id} product={p} />)}
                </div>
                <div className="mt-8">
                  <Pagination
                    page={page}
                    totalPages={pagination.totalPages || 1}
                    onPageChange={(p) => updateFilter('page', p.toString())}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
