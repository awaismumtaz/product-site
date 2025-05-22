import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import About from './pages/About';
import RequireAuth from './components/RequireAuth';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminSales from './pages/admin/AdminSales';
import AdminOrders from './pages/admin/AdminOrders';
import Layout from './components/Layout';
import { CartProvider } from './context/CartContext';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <CartProvider>
        <Layout />
      </CartProvider>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'product/:id', element: <Product /> },
      { path: 'cart', element: <Cart/> },
      { path: 'orders', element: <RequireAuth><Orders/></RequireAuth> },
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
      }
    ]
  }
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
