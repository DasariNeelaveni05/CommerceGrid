import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../services/api';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Order Placed — CommerceGrid';
    getOrderById(id)
      .then((res) => setOrder(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '40px 20px' }}>
      <div className="card" style={{ maxWidth: '600px', width: '100%', padding: '40px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '3rem', margin: '0 auto 24px auto' }}>
          ✓
        </div>
        
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Payment Successful!</h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '32px' }}>Thank you for your purchase. Your order has been placed successfully.</p>

        {order && (
          <div style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '24px', textAlign: 'left', marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <span style={{ color: '#64748b' }}>Order ID</span>
              <strong style={{ fontFamily: 'monospace', fontSize: '0.95rem' }}>{order.id}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Total Paid</span>
              <strong style={{ color: 'var(--primary)' }}>₹{Number(order.totalAmount).toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Payment Status</span>
              <span className="badge badge-green" style={{ textTransform: 'capitalize' }}>{order.paymentStatus}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Order Status</span>
              <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{order.orderStatus}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Shipping Address</span>
              <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 500, color: '#334155' }}>{order.shippingAddress}</p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link to="/orders" className="btn btn-primary" style={{ padding: '12px 24px' }}>View My Orders</Link>
          <Link to="/products" className="btn btn-secondary" style={{ padding: '12px 24px' }}>Continue Shopping</Link>
        </div>
      </div>
    </main>
  );
}
