import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

const EMPTY_FORM = { name: '', icon: '📦', color: '#3B82F6', description: '', order: 0 };
const PRESET_ICONS = ['📱','💻','🎧','🔌','👕','📚','🏏','🪑','🎮','🏠','🚲','📷','⌚','🎵','🏋️'];

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) { navigate('/login'); return; }
    document.title = 'Category Management — CommerceGrid';
    fetchCategories();
  }, [isAdmin]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const r = await getCategories();
      setCategories(r.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await deleteCategory(id);
      fetchCategories();
    } catch (e) { alert(e.response?.data?.message || 'Delete failed.'); }
  };

  const openCreate = () => { setEditingCat(null); setForm(EMPTY_FORM); setFormError(''); setShowForm(true); };
  const openEdit = (c) => { setEditingCat(c); setForm({ name: c.name, icon: c.icon, color: c.color, description: c.description || '', order: c.order || 0 }); setFormError(''); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true); setFormError('');
    try {
      if (editingCat) await updateCategory(editingCat.id, form);
      else await createCategory(form);
      setShowForm(false); fetchCategories();
    } catch (e) {
      setFormError(e.response?.data?.message || 'Failed to save category.');
    } finally { setFormLoading(false); }
  };
 
  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-header">
          <div>
            <Link to="/admin" style={{ color: 'var(--primary-light)', fontSize: '0.85rem' }}>← Dashboard</Link>
            <h1 className="admin-header__title">Category Management</h1>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>+ Add Category</button>
        </div>
 
        {loading ? (
          <div className="loader"><div className="spinner" /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {categories.map((cat) => (
              <div key={cat.id} className="card" style={{ padding: '20px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-md)', background: cat.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0, border: `2px solid ${cat.color}30` }}>
                  {cat.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '4px', color: 'var(--dark)' }}>{cat.name}</h3>
                  {cat.description && <p style={{ fontSize: '0.78rem', color: 'var(--gray)', lineHeight: 1.4 }}>{cat.description}</p>}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(cat)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat.id, cat.name)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '32px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2>{editingCat ? 'Edit Category' : 'Add Category'}</h2>
                <button onClick={() => setShowForm(false)} style={{ fontSize: '1.5rem', color: 'var(--gray)', cursor: 'pointer', border: 'none', background: 'none' }}>×</button>
              </div>

              {formError && <div className="alert alert-error mb-4">{formError}</div>}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input id="cat-name" className="form-input" required value={form.name} onChange={(e) => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Electronics" />
                </div>

                <div className="form-group">
                  <label className="form-label">Icon</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                    {PRESET_ICONS.map((ic) => (
                      <button
                        key={ic} type="button"
                        style={{ fontSize: '1.4rem', padding: '6px', border: `2px solid ${form.icon === ic ? 'var(--primary-light)' : 'var(--border)'}`, borderRadius: 'var(--radius)', background: form.icon === ic ? 'var(--primary-pale)' : 'white', cursor: 'pointer' }}
                        onClick={() => setForm(f => ({...f, icon: ic}))}
                      >{ic}</button>
                    ))}
                  </div>
                  <input id="cat-icon" className="form-input" value={form.icon} onChange={(e) => setForm(f => ({...f, icon: e.target.value}))} placeholder="Or type an emoji" />
                </div>

                <div className="form-group">
                  <label className="form-label">Color</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input id="cat-color-picker" type="color" value={form.color} onChange={(e) => setForm(f => ({...f, color: e.target.value}))} style={{ width: '48px', height: '40px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer' }} />
                    <input id="cat-color-text" className="form-input" value={form.color} onChange={(e) => setForm(f => ({...f, color: e.target.value}))} placeholder="#3B82F6" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea id="cat-desc" className="form-input" rows="3" value={form.description} onChange={(e) => setForm(f => ({...f, description: e.target.value}))} placeholder="Short category description..." />
                </div>

                <div className="form-group">
                  <label className="form-label">Display Order</label>
                  <input id="cat-order" type="number" className="form-input" min="0" value={form.order} onChange={(e) => setForm(f => ({...f, order: parseInt(e.target.value) || 0}))} />
                </div>

                {/* Preview */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: 'var(--bg-2)', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-md)', background: form.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', border: `2px solid ${form.color}30` }}>{form.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{form.name || 'Category Name'}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gray)' }}>{form.description || 'Description'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={formLoading}>
                    {formLoading ? 'Saving...' : editingCat ? 'Update' : 'Create'}
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
