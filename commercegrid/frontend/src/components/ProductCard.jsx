import { Link } from 'react-router-dom';

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
}

export default function ProductCard({ product }) {
  const primaryImage =
    product.images?.find((i) => i.isPrimary)?.url || product.images?.[0]?.url || '';

  const discountPct =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : 0;

  const availability = product.availability || 'in_stock';
  const availLabel = { in_stock: 'In Stock', out_of_stock: 'Out of Stock', limited: 'Limited' };

  return (
    <Link to={`/products/${product.slug || product.id}`} className="product-card animate-in">
      {/* Image */}
      <div className="product-card__image-wrap">
        {primaryImage ? (
          <img className="product-card__image" src={primaryImage} alt={product.title} loading="lazy" />
        ) : (
          <div className="product-card__image-placeholder">🛍️</div>
        )}

        {discountPct > 0 && (
          <span className="product-card__badge">-{discountPct}%</span>
        )}
        {product.isFeatured && !discountPct && (
          <span className="product-card__badge product-card__badge--featured">⭐ Featured</span>
        )}
      </div>

      {/* Body */}
      <div className="product-card__body">
        {product.category && (
          <span className="product-card__category">
            {product.category.icon} {product.category.name}
          </span>
        )}

        <h3 className="product-card__title">{product.title}</h3>

        {product.brand && (
          <span className="product-card__brand">{product.brand}</span>
        )}

        {product.averageRating > 0 && (
          <div className="product-card__rating">
            <span className="product-card__stars">{renderStars(product.averageRating)}</span>
            <span className="product-card__rating-count">
              {product.averageRating.toFixed(1)} ({product.reviewCount || 0})
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="product-card__footer">
        <div>
          <div className="product-card__price">₹{Number(product.price).toLocaleString()}</div>
          {product.originalPrice && (
            <div className="product-card__original-price">
              ₹{Number(product.originalPrice).toLocaleString()}
            </div>
          )}
        </div>
        <span className={`product-card__availability product-card__availability--${availability}`}>
          {availLabel[availability]}
        </span>
      </div>
    </Link>
  );
}
