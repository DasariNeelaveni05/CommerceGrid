import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, getProducts } from '../services/api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Categories — CommerceGrid';
    const fetchData = async () => {
      try {
        const catRes = await getCategories();
        const cats = catRes.data.data || [];
        setCategories(cats);

        // Get product counts per category
        const countMap = {};
        await Promise.all(
          cats.map(async (cat) => {
            try {
              const r = await getProducts({ category: cat.slug, limit: 1 });
              countMap[cat.id] = r.data.pagination?.total || 0;
            } catch {
              countMap[cat.id] = 0;
            }
          })
        );
        setCounts(countMap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <main>
      {/* Header */}
      <section style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
        padding: '60px 0', color: 'white', textAlign: 'center'
      }}>
        <div className="container">
          <h1 style={{ color: 'white', marginBottom: '12px' }}>Product Categories</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.05rem' }}>
            Browse {categories.length} categories with thousands of products
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="section">
        <div className="container">
          {loading ? (
            <div className="loader"><div className="spinner" /></div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '20px',
            }}>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug}`}
                  className="card animate-in"
                  style={{ padding: '28px 20px', textAlign: 'center', textDecoration: 'none' }}
                >
                  <div style={{
                    width: '80px', height: '80px', borderRadius: 'var(--radius-lg)',
                    background: cat.color + '15', border: `2px solid ${cat.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px', fontSize: '2.5rem',
                    transition: 'transform 0.3s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {cat.icon}
                  </div>
                  <h3 style={{ fontSize: '1rem', color: 'var(--dark)', marginBottom: '6px' }}>
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--gray)', marginBottom: '10px', lineHeight: '1.4' }}>
                      {cat.description}
                    </p>
                  )}
                  <div style={{
                    display: 'inline-block', background: cat.color + '15',
                    color: cat.color, padding: '3px 12px', borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem', fontWeight: '700',
                  }}>
                    {counts[cat.id] || 0} Products
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
