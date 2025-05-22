import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const nav = useNavigate();
  const { user, logout, hasRole } = useAuth();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      nav('/login');
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography component={Link} to="/" variant="h6" sx={{ color: 'inherit', textDecoration: 'none', flexGrow: 1 }}>
          Grocery Shop
        </Typography>

        <Button component={Link} to="/" color="inherit">Home</Button>
        {user && (
          <>
            <Button component={Link} to="/cart" color="inherit">Cart</Button>
            <Button component={Link} to="/orders" color="inherit">Orders</Button>
          </>
        )}

        {hasRole('Admin') && (
          <>
            <Button component={Link} to="/admin/products" color="inherit">Manage Products</Button>
            <Button component={Link} to="/admin/categories" color="inherit">Categories</Button>
          </>
        )}

        {user
          ? <Button onClick={handleLogout} color="inherit">Logout</Button>
          : <>
              <Button component={Link} to="/login" color="inherit">Login</Button>
              <Button component={Link} to="/register" color="inherit">Register</Button>
            </>
        }
      </Toolbar>
    </AppBar>
  );
}
