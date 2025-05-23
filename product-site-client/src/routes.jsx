import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import MyReviews from './pages/MyReviews';
import About from './pages/About';
import RequireAuth from './components/RequireAuth';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminSales from './pages/admin/AdminSales';
import AdminOrders from './pages/admin/AdminOrders';
import AdminReviews from './pages/AdminReviews';
import AdminUsers from './pages/admin/AdminUsers';
import Layout from './components/Layout';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthProvider>
        <CartProvider>
          <Layout />
        </CartProvider>
      </AuthProvider>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'product/:id', element: <Product /> },
      { path: 'cart', element: <Cart/> },
      { path: 'orders', element: <RequireAuth><Orders/></RequireAuth> },
      { path: 'reviews', element: <RequireAuth><MyReviews/></RequireAuth> },
      { 
        path: 'admin/products', 
        element: <RequireAuth role="Admin"><AdminProducts/></RequireAuth> 
      },
      { 
        path: 'admin/categories', 
        element: <RequireAuth role="Admin"><AdminCategories/></RequireAuth> 
      },
      { 
        path: 'admin/sales', 
        element: <RequireAuth role="Admin"><AdminSales/></RequireAuth> 
      },
      {
        path: 'admin/orders',
        element: <RequireAuth role="Admin"><AdminOrders/></RequireAuth>
      },
      {
        path: 'admin/reviews',
        element: <RequireAuth role="Admin"><AdminReviews/></RequireAuth>
      },
      {
        path: 'admin/users',
        element: <RequireAuth role="Admin"><AdminUsers/></RequireAuth>
      }
    ]
  }
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
