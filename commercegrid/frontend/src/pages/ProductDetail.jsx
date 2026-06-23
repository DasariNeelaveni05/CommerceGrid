import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById, addReview, addToCart } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import './ProductDetail.css';

function Stars({ rating, max = 5 }) {
  return (
    <span style={{ color: '#F59E0B', letterSpacing: '-1px' }}>
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(max - Math.round(rating))}
    </span>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartLoading, setCartLoading] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);

  const handleAddToCart = async () => {
    if (!user) return navigate('/login');
    setCartLoading(true);
    setCartSuccess(false);
    try {
      await addToCart(product.id, 1);
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add item to cart.');
    } finally {
      setCartLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) return navigate('/login');
    setCartLoading(true);
    try {
      await addToCart(product.id, 1);
      navigate('/cart');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add item to cart.');
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    getProductById(id)
      .then((res) => {
        const p = res.data.data;
        setProduct(p);
        document.title = `${p.title} — CommerceGrid`;
      })
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setReviewLoading(true);
    setReviewError('');
    try {
      await addReview(product.id || product._id, reviewForm);
      const res = await getProductById(id);
      setProduct(res.data.data);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return <div className="loader" style={{ minHeight: '80vh' }}><div className="spinner" /></div>;
  if (!product) return null;

  const images = product.images || [];
  const discountPct = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  return (
    <main className="product-detail">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link> / <Link to="/products">Products</Link>
          {product.category && <> / <Link to={`/products?category=${product.category.slug}`}>{product.category.name}</Link></>}
          / <span>{product.title}</span>
        </nav>

        {/* Product Main */}
        <div className="product-detail__main">
          {/* Gallery */}
          <div className="product-gallery">
            <div className="product-gallery__main">
              {images.length > 0 ? (
                <img src={images[activeImg]?.url} alt={product.title} className="product-gallery__img" />
              ) : (
                <div className="product-gallery__placeholder">🛍️</div>
              )}
              {discountPct > 0 && (
                <div className="product-gallery__badge">-{discountPct}% OFF</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="product-gallery__thumbs">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`product-gallery__thumb${i === activeImg ? ' product-gallery__thumb--active' : ''}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={img.url} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-info">
            {product.category && (
              <Link to={`/products?category=${product.category.slug}`} className="product-info__category">
                {product.category.icon} {product.category.name}
              </Link>
            )}
            <h1 className="product-info__title">{product.title}</h1>

            {product.brand && (
              <p className="product-info__brand">Brand: <strong>{product.brand}</strong></p>
            )}

            {/* Rating */}
            {product.averageRating > 0 && (
              <div className="product-info__rating">
                <Stars rating={product.averageRating} />
                <span className="product-info__rating-val">{product.averageRating}</span>
                <span className="product-info__rating-count">({product.reviewCount} reviews)</span>
                <span style={{ color: 'var(--gray)', fontSize: '0.8rem' }}>·</span>
                <span className="product-info__views">{product.viewsCount} views</span>
              </div>
            )}

            {/* Price */}
            <div className="product-info__price-block">
              <span className="product-info__price">₹{Number(product.price).toLocaleString()}</span>
              {product.originalPrice && (
                <span className="product-info__original">₹{Number(product.originalPrice).toLocaleString()}</span>
              )}
              {discountPct > 0 && (
                <span className="badge badge-green">{discountPct}% off</span>
              )}
            </div>

            {/* Availability */}
            <div className={`product-card__availability product-card__availability--${product.availability || 'in_stock'}`}>
              {{ in_stock: '✓ In Stock', out_of_stock: '✗ Out of Stock', limited: '⚠ Limited Stock' }[product.availability || 'in_stock']}
            </div>

            {/* Condition */}
            <div className="product-info__meta">
              <div className="product-info__meta-item">
                <span>Condition</span>
                <strong style={{ textTransform: 'capitalize' }}>{product.condition?.replace('_', ' ')}</strong>
              </div>
              {product.city && (
                <div className="product-info__meta-item">
                  <span>Location</span>
                  <strong>{product.city}{product.state ? `, ${product.state}` : ''}</strong>
                </div>
              )}
              {product.stock !== undefined && (
                <div className="product-info__meta-item">
                  <span>Stock</span>
                  <strong>{product.stock} units</strong>
                </div>
              )}
            </div>

            {/* Checkout Options */}
            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
              <button 
                id="add-to-cart-btn"
                className="btn btn-secondary btn-lg" 
                style={{ flex: '1 1 200px', padding: '14px', fontSize: '1.05rem', borderWidth: '2px' }}
                disabled={cartLoading || product.stock === 0}
                onClick={handleAddToCart}
              >
                {product.stock === 0 ? 'Out of Stock' : cartLoading ? 'Adding...' : cartSuccess ? '✓ Added to Cart!' : 'Add to Cart 🛒'}
              </button>
              <button 
                id="buy-now-btn"
                className="btn btn-primary btn-lg" 
                style={{ flex: '1 1 200px', padding: '14px', fontSize: '1.05rem' }}
                disabled={cartLoading || product.stock === 0}
                onClick={handleBuyNow}
              >
                Buy Now ⚡
              </button>
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="product-info__tags">
                {product.tags.map((t) => (
                  <Link key={t} to={`/products?q=${t}`} className="badge badge-blue">#{t}</Link>
                ))}
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="product-info__desc">
                <h4>Description</h4>
                <p>{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <section className="product-reviews">
          <h2>Customer Reviews</h2>
          {product.reviews?.length === 0 && (
            <p style={{ color: 'var(--gray)', marginBottom: '24px' }}>No reviews yet. Be the first!</p>
          )}

          {/* Review List */}
          <div className="reviews-list">
            {(product.reviews || []).map((r) => (
              <div key={r.id || r._id} className="review-card">
                <div className="review-card__header">
                  <div className="review-card__avatar">
                    {r.user?.firstName?.[0] || r.user?.email?.[0] || '?'}
                  </div>
                  <div>
                    <div className="review-card__name">
                      {r.user?.firstName} {r.user?.lastName}
                    </div>
                    <Stars rating={r.rating} />
                  </div>
                  <span className="review-card__date">
                    {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                {r.comment && <p className="review-card__comment">{r.comment}</p>}
              </div>
            ))}
          </div>

          {/* Add Review */}
          <div className="review-form-wrap">
            <h3>Write a Review</h3>
            {!user ? (
              <p>Please <Link to="/login" style={{ color: 'var(--primary-light)' }}>sign in</Link> to leave a review.</p>
            ) : (
              <form onSubmit={handleReviewSubmit} className="review-form">
                {reviewError && <div className="alert alert-error">{reviewError}</div>}
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <div className="rating-selector">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        type="button"
                        className={`rating-star${reviewForm.rating >= r ? ' rating-star--active' : ''}`}
                        onClick={() => setReviewForm((f) => ({ ...f, rating: r }))}
                      >
                        ★
                      </button>
                    ))}
                    <span style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>{reviewForm.rating}/5</span>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Comment (optional)</label>
                  <textarea
                    className="form-input"
                    rows="4"
                    placeholder="Share your experience..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={reviewLoading}>
                  {reviewLoading ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </section>

        {/* Related Products */}
        {product.related?.length > 0 && (
          <section className="section">
            <div className="section-header">
              <h2 className="section-header__title">Related Products</h2>
            </div>
            <div className="products-grid">
              {product.related.map((p) => <ProductCard key={p.id || p._id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
