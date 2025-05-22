import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home';
import Product from './pages/Product';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import RequireAuth from './components/RequireAuth';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminSales from './pages/admin/AdminSales';
import AdminOrders from './pages/admin/AdminOrders';
import Layout from './components/Layout';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'product/:id', element: <Product /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
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
