import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, updateCartItem, removeFromCart, createOrder } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [shipping, setShipping] = useState({ address: '', phone: '' });
  const [payment, setPayment] = useState({ cardNumber: '', expiry: '', cvv: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    document.title = 'My Cart — CommerceGrid';
    fetchCart();

    // Pre-populate shipping address and phone from user profile
    const addrParts = [
      user.addressStreet,
      user.addressCity,
      user.addressState,
      user.addressPincode,
      user.addressCountry
    ].filter(Boolean);
    
    setShipping({
      address: addrParts.join(', ') || '',
      phone: user.phone || '',
    });
  }, [user, navigate]);

  const fetchCart = () => {
    getCart()
      .then((res) => setItems(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleQuantityChange = async (itemId, newQty) => {
    if (newQty < 1) return;
    try {
      await updateCartItem(itemId, newQty);
      fetchCart();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update quantity.');
    }
  };

  const handleRemove = async (itemId) => {
    if (!window.confirm('Remove this item from your cart?')) return;
    try {
      await removeFromCart(itemId);
      fetchCart();
    } catch (err) {
      alert('Failed to remove item.');
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!shipping.address.trim() || !shipping.phone.trim()) {
      setError('Shipping address and contact phone are required.');
      return;
    }
    setCheckoutLoading(true);
    setError('');
    try {
      const res = await createOrder({
        shippingAddress: shipping.address,
        contactPhone: shipping.phone,
      });
      navigate(`/order-success/${res.data.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const shippingFee = subtotal > 5000 ? 0 : 150;
  const total = subtotal + shippingFee;

  const getImg = (p) => p?.images?.find((i) => i.isPrimary)?.url || p?.images?.[0]?.url || '';

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  if (items.length === 0) {
    return (
      <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', maxWidth: '480px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🛒</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Your Cart is Empty</h2>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/products" className="btn btn-primary" style={{ display: 'inline-block', padding: '12px 24px' }}>Browse Catalog</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '80vh', background: '#f8fafc', padding: '40px 20px' }}>
      <div className="container">
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '32px' }}>Shopping Cart</h1>

        <div className="cart-grid">
          {/* Cart items list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {items.map((item) => (
              <div key={item.id} className="card" style={{ padding: '20px', display: 'flex', gap: '20px', alignItems: 'center', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                {getImg(item.product) ? (
                  <img src={getImg(item.product)} alt={item.product?.title} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                ) : (
                  <div style={{ width: '80px', height: '80px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', borderRadius: '8px' }}>🛍️</div>
                )}

                <div style={{ flex: 1 }}>
                  <Link to={`/products/${item.product?.slug || item.product?.id}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>{item.product?.title}</h3>
                  </Link>
                  <p style={{ color: 'var(--primary)', fontWeight: 700, margin: 0 }}>₹{Number(item.product?.price).toLocaleString()}</p>
                </div>

                {/* Quantity adjuster */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleQuantityChange(item.id, item.quantity - 1)} style={{ padding: '2px 8px', fontSize: '1rem', border: 'none', background: 'none', cursor: 'pointer' }}>-</button>
                  <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleQuantityChange(item.id, item.quantity + 1)} style={{ padding: '2px 8px', fontSize: '1rem', border: 'none', background: 'none', cursor: 'pointer' }}>+</button>
                </div>

                <div style={{ fontWeight: 700, minWidth: '90px', textAlign: 'right' }}>
                  ₹{Number((item.product?.price || 0) * item.quantity).toLocaleString()}
                </div>

                <button onClick={() => handleRemove(item.id)} style={{ border: 'none', background: 'none', color: '#ef4444', fontSize: '1.25rem', cursor: 'pointer', padding: '8px' }}>×</button>
              </div>
            ))}
          </div>

          {/* Checkout sidebar */}
          <div className="card" style={{ padding: '32px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>Order Summary</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Shipping</span>
                <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.2rem', borderTop: '1px solid #f1f5f9', paddingTop: '16px', color: '#0f172a' }}>
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Billing / Checkout Shipping Form */}
            <form onSubmit={handleCheckout} style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>Shipping Address</h3>
              
              {error && <div className="alert alert-error">{error}</div>}

              <div className="form-group">
                <label className="form-label">Delivery Address *</label>
                <textarea
                  id="shipping-address"
                  className="form-input"
                  rows="3"
                  required
                  value={shipping.address}
                  onChange={(e) => setShipping((s) => ({ ...s, address: e.target.value }))}
                  placeholder="Street, City, State, Pincode"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone *</label>
                <input
                  id="shipping-phone"
                  className="form-input"
                  required
                  value={shipping.phone}
                  onChange={(e) => setShipping((s) => ({ ...s, phone: e.target.value }))}
                  placeholder="e.g. +91 9876543210"
                />
              </div>

              {/* Payment Details */}
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '12px 0 4px 0' }}>Simulated Payment</h3>
              <div className="form-group">
                <label className="form-label">Card Number (Simulated)</label>
                <input
                  className="form-input"
                  placeholder="4111 2222 3333 4444"
                  maxLength={19}
                  value={payment.cardNumber}
                  onChange={(e) => setPayment((p) => ({ ...p, cardNumber: e.target.value }))}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input
                    className="form-input"
                    placeholder="MM/YY"
                    maxLength={5}
                    value={payment.expiry}
                    onChange={(e) => setPayment((p) => ({ ...p, expiry: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">CVV</label>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="123"
                    maxLength={3}
                    value={payment.cvv}
                    onChange={(e) => setPayment((p) => ({ ...p, cvv: e.target.value }))}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '12px' }} disabled={checkoutLoading}>
                {checkoutLoading ? 'Processing Payment...' : 'Secure Checkout & Place Order'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
