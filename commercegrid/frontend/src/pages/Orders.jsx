import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyOrders } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    document.title = 'My Orders — CommerceGrid';
    getMyOrders()
      .then((res) => setOrders(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const getImg = (p) => p?.images?.find((i) => i.isPrimary)?.url || p?.images?.[0]?.url || '';

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'badge-yellow';
      case 'processing': return 'badge-blue';
      case 'shipped': return 'badge-green';
      case 'delivered': return 'badge-green';
      default: return 'badge-gray';
    }
  };

  const getStatusText = (status) => {
    if (status === 'shipped') return 'Successfully Shipped';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  if (orders.length === 0) {
    return (
      <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', maxWidth: '480px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📦</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>No Orders Found</h2>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>You haven't placed any orders in our catalog yet.</p>
          <Link to="/products" className="btn btn-primary" style={{ display: 'inline-block', padding: '12px 24px' }}>Start Shopping</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '80vh', background: '#f8fafc', padding: '40px 20px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '32px' }}>Order History</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {orders.map((order) => (
            <div key={order.id} className="card" style={{ padding: '24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              
              {/* Order Header */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '20px', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Order Date</span>
                  <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Order ID</span>
                  <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px', fontFamily: 'monospace' }}>
                    {order.id}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Paid</span>
                  <div style={{ fontWeight: 700, color: 'var(--primary)', marginTop: '2px' }}>
                    ₹{Number(order.totalAmount).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Order Status</span>
                  <div style={{ marginTop: '4px' }}>
                    <span className={`badge ${getStatusBadgeClass(order.orderStatus)}`}>
                      {getStatusText(order.orderStatus)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {order.items?.map((item) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {getImg(item.product) ? (
                      <img src={getImg(item.product)} alt={item.product?.title} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />
                    ) : (
                      <div style={{ width: '48px', height: '48px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', borderRadius: '6px' }}>🛍️</div>
                    )}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', margin: '0 0 2px 0' }}>{item.product ? item.product.title : 'Deleted Product'}</h4>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Qty: {item.quantity}</span>
                    </div>
                    <div style={{ fontWeight: 600, color: '#334155' }}>
                      ₹{Number(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping Address */}
              <div style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px', fontSize: '0.85rem', color: '#64748b' }}>
                <strong>Deliver To: </strong> {order.shippingAddress} (Phone: {order.contactPhone})
              </div>

            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
