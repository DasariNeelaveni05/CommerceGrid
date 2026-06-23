import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct, getCategories, createProduct, updateProduct } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

const EMPTY_FORM = {
  title: '', description: '', price: '', originalPrice: '',
  brand: '', condition: 'new', category: '', tags: '',
  city: '', state: '', isFeatured: false, stock: 1, availability: 'in_stock',
};

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [searchQ, setSearchQ] = useState('');
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) { navigate('/login'); return; }
    document.title = 'Product Management — CommerceGrid';
    fetchProducts();
    getCategories().then((r) => setCategories(r.data.data || [])).catch(() => {});
  }, [isAdmin, page, searchQ]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const r = await getProducts({ page, limit: 15, q: searchQ });
      setProducts(r.data.data || []);
      setPagination(r.data.pagination || {});
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (e) { alert(e.response?.data?.message || 'Delete failed.'); }
  };

  const openCreateForm = () => {
    setEditingProduct(null); setForm(EMPTY_FORM); setImages([]);
    setFormError(''); setShowForm(true);
  };
  const openEditForm = (p) => {
    setEditingProduct(p);
    setForm({
      title: p.title, description: p.description || '', price: p.price,
      originalPrice: p.originalPrice || '', brand: p.brand || '',
      condition: p.condition || 'new', category: p.category?.id || p.category?._id || '',
      tags: (p.tags || []).join(', '), city: p.city || '', state: p.state || '',
      isFeatured: p.isFeatured || false, stock: p.stock || 1,
      availability: p.availability || 'in_stock',
    });
    setImages([]); setFormError(''); setShowForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true); setFormError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach((f) => fd.append('images', f));

      if (editingProduct) {
        await updateProduct(editingProduct.id || editingProduct._id, fd);
      } else {
        await createProduct(fd);
      }
      setShowForm(false); fetchProducts();
    } catch (e) {
      setFormError(e.response?.data?.message || 'Failed to save product.');
    } finally { setFormLoading(false); }
  };

  const getImg = (p) => p.images?.find((i) => i.isPrimary)?.url || p.images?.[0]?.url || '';

  return (
    <main className="admin-page">
      <div className="container">
        {/* Header */}
        <div className="admin-header">
          <div>
            <Link to="/admin" style={{ color: 'var(--primary-light)', fontSize: '0.85rem' }}>← Dashboard</Link>
            <h1 className="admin-header__title">Product Management</h1>
          </div>
          <button className="btn btn-primary" onClick={openCreateForm}>+ Add Product</button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
          <input
            className="form-input"
            placeholder="Search products..."
            value={searchQ}
            onChange={(e) => { setSearchQ(e.target.value); setPage(1); }}
            style={{ maxWidth: '360px' }}
          />
          <span style={{ color: 'var(--gray)', alignSelf: 'center', fontSize: '0.85rem' }}>
            {pagination.total || 0} total products
          </span>
        </div>

        {/* Table */}
        {loading ? (
          <div className="loader"><div className="spinner" /></div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id || p._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {getImg(p) ? (
                          <img className="admin-table__img" src={getImg(p)} alt={p.title} />
                        ) : (
                          <div className="admin-table__img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🛍️</div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--dark)', maxWidth: '200px' }} className="truncate">{p.title}</div>
                          {p.brand && <div style={{ fontSize: '0.78rem', color: 'var(--gray)' }}>{p.brand}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      {p.category && <span className="badge badge-blue">{p.category.icon} {p.category.name}</span>}
                    </td>
                    <td>
                      <strong style={{ color: 'var(--primary)' }}>₹{Number(p.price).toLocaleString()}</strong>
                      {p.originalPrice && <div style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: 'var(--gray-light)' }}>₹{Number(p.originalPrice).toLocaleString()}</div>}
                    </td>
                    <td>{p.stock ?? '—'}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {p.isFeatured && <span className="badge badge-yellow">⭐ Featured</span>}
                        <span className={`badge ${p.isActive ? 'badge-green' : 'badge-gray'}`}>{p.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditForm(p)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id || p._id, p.title)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '24px' }}>
              {page > 1 && <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => p - 1)}>← Prev</button>}
              <span style={{ alignSelf: 'center', fontSize: '0.85rem', color: 'var(--gray)' }}>Page {page} of {pagination.totalPages || 1}</span>
              {page < (pagination.totalPages || 1) && <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => p + 1)}>Next →</button>}
            </div>
          </>
        )}

        {/* Product Form Modal */}
        {showForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', overflowY: 'auto' }}>
            <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '32px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={() => setShowForm(false)} style={{ fontSize: '1.5rem', lineHeight: 1, color: 'var(--gray)', cursor: 'pointer', border: 'none', background: 'none' }}>×</button>
              </div>

              {formError && <div className="alert alert-error mb-4">{formError}</div>}

              <form onSubmit={handleFormSubmit} className="admin-form" style={{ border: 'none', padding: 0 }}>
                <div className="admin-form__grid">
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Product Title *</label>
                    <input id="prod-title" className="form-input" required value={form.title} onChange={(e) => setForm(f => ({...f, title: e.target.value}))} placeholder="e.g. iPhone 15 Pro Max 256GB" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (₹) *</label>
                    <input id="prod-price" type="number" className="form-input" required min="0" step="0.01" value={form.price} onChange={(e) => setForm(f => ({...f, price: e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Original Price (₹)</label>
                    <input id="prod-original-price" type="number" className="form-input" min="0" step="0.01" value={form.originalPrice} onChange={(e) => setForm(f => ({...f, originalPrice: e.target.value}))} placeholder="For discount display" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Brand</label>
                    <input id="prod-brand" className="form-input" value={form.brand} onChange={(e) => setForm(f => ({...f, brand: e.target.value}))} placeholder="e.g. Apple" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select id="prod-category" className="form-input form-select" required value={form.category} onChange={(e) => setForm(f => ({...f, category: e.target.value}))}>
                      <option value="">Select Category</option>
                      {categories.map((c) => <option key={c.id || c._id} value={c.id || c._id}>{c.icon} {c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Condition</label>
                    <select id="prod-condition" className="form-input form-select" value={form.condition} onChange={(e) => setForm(f => ({...f, condition: e.target.value}))}>
                      {['new','like_new','good','fair','poor'].map((c) => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock</label>
                    <input id="prod-stock" type="number" className="form-input" min="0" value={form.stock} onChange={(e) => setForm(f => ({...f, stock: e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Availability</label>
                    <select id="prod-availability" className="form-input form-select" value={form.availability} onChange={(e) => setForm(f => ({...f, availability: e.target.value}))}>
                      <option value="in_stock">In Stock</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="limited">Limited</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input id="prod-city" className="form-input" value={form.city} onChange={(e) => setForm(f => ({...f, city: e.target.value}))} placeholder="e.g. Mumbai" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input id="prod-state" className="form-input" value={form.state} onChange={(e) => setForm(f => ({...f, state: e.target.value}))} placeholder="e.g. Maharashtra" />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Tags (comma-separated)</label>
                    <input id="prod-tags" className="form-input" value={form.tags} onChange={(e) => setForm(f => ({...f, tags: e.target.value}))} placeholder="e.g. apple, iphone, 5g" />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Description</label>
                    <textarea id="prod-desc" className="form-input" rows="4" value={form.description} onChange={(e) => setForm(f => ({...f, description: e.target.value}))} placeholder="Product description..." />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Images (max 5)</label>
                    <input id="prod-images" type="file" accept="image/*" multiple className="form-input" onChange={(e) => setImages(Array.from(e.target.files))} />
                    {images.length > 0 && <span style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>{images.length} file(s) selected</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input id="prod-featured" type="checkbox" checked={form.isFeatured} onChange={(e) => setForm(f => ({...f, isFeatured: e.target.checked}))} />
                    <label htmlFor="prod-featured" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Mark as Featured</label>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={formLoading}>
                    {formLoading ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
