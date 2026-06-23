import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import Categories from './pages/Categories';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ProductManagement from './pages/ProductManagement';
import CategoryManagement from './pages/CategoryManagement';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import AdminOrders from './pages/AdminOrders';

// Guard for admin-only routes
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader" style={{ minHeight: '100vh' }}><div className="spinner" /></div>;
  return user?.role === 'admin' ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order-success/:id" element={<OrderSuccess />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><ProductManagement /></AdminRoute>} />
        <Route path="/admin/categories" element={<AdminRoute><CategoryManagement /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
