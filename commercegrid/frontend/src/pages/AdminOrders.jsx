import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAdminOrders, updateOrderStatus } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminOrders() {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    document.title = 'Order Management — CommerceGrid';
    fetchOrders();
  }, [isAdmin, navigate]);

  const fetchOrders = () => {
    setLoading(true);
    getAdminOrders()
      .then((res) => setOrders(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, { orderStatus: newStatus });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status.');
    }
  };

  const handlePaymentStatusChange = async (orderId, newPayStatus) => {
    try {
      await updateOrderStatus(orderId, { paymentStatus: newPayStatus });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update payment status.');
    }
  };

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <main className="admin-page" style={{ minHeight: '80vh', padding: '40px 20px', background: '#f8fafc' }}>
      <div className="container">
        
        <div className="admin-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Link to="/admin" style={{ color: 'var(--primary-light)', fontSize: '0.85rem' }}>← Dashboard</Link>
            <h1 className="admin-header__title" style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>Order Management</h1>
          </div>
          <button className="btn btn-secondary" onClick={fetchOrders}>Refresh Orders</button>
        </div>

        {orders.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', background: 'white' }}>
            <p style={{ color: '#64748b', fontSize: '1.1rem', margin: 0 }}>No customer orders placed yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map((order) => (
              <div key={order.id} className="card" style={{ padding: '24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                
                {/* Header row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '16px', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Order ID</span>
                    <div style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.9rem', marginTop: '2px' }}>{order.id}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Customer</span>
                    <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
                      {order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest'}
                    </div>
                    {order.user && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{order.user.email}</div>}
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Total Paid</span>
                    <div style={{ fontWeight: 700, color: 'var(--primary)', marginTop: '2px', fontSize: '1.05rem' }}>
                      ₹{Number(order.totalAmount).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Date Placed</span>
                    <div style={{ fontWeight: 500, color: '#334155', marginTop: '2px', fontSize: '0.85rem' }}>
                      {new Date(order.createdAt).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                  {order.items?.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span style={{ color: '#334155', fontWeight: 500 }}>
                        {item.product ? item.product.title : 'Deleted Product'} <span style={{ color: '#64748b' }}>x {item.quantity}</span>
                      </span>
                      <strong style={{ color: '#0f172a' }}>₹{Number(item.price * item.quantity).toLocaleString()}</strong>
                    </div>
                  ))}
                </div>

                {/* Shipping & Controls */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', flex: 1, minWidth: '240px' }}>
                    <strong>Shipping Address:</strong> {order.shippingAddress} (Phone: {order.contactPhone})
                  </div>
                  
                  {/* Status Dropdowns */}
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    
                    {/* Payment Status Dropdown */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Payment:</span>
                      <select 
                        className="form-input form-select"
                        style={{ padding: '6px 12px', fontSize: '0.85rem', width: 'auto' }}
                        value={order.paymentStatus}
                        onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>

                    {/* Order Status Dropdown */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Shipping:</span>
                      <select 
                        className="form-input form-select"
                        style={{ padding: '6px 12px', fontSize: '0.85rem', width: 'auto' }}
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Successfully Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>

                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
