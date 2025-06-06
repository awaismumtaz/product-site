import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Dialog, Tabs, Tab, TextField, Alert, CircularProgress, Checkbox, FormControlLabel, IconButton, Tooltip, Menu, MenuItem } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Header() {
  const [tab, setTab] = useState(0); // 0 = Login, 1 = Register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminMenuAnchor, setAdminMenuAnchor] = useState(null);
  const { user, login, register, logout, hasRole, loading, loginModalOpen, openLoginModal, closeLoginModal } = useAuth();
  const nav = useNavigate();

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ justifyContent: 'center' }}>
          <CircularProgress size={24} />
        </Toolbar>
      </AppBar>
    );
  }

  const handleOpenLogin = () => {
    openLoginModal();
    setTab(0);
    setEmail('');
    setPassword('');
    setKeepLoggedIn(false);
    setError('');
  };

  const handleTabChange = (_, newValue) => {
    setTab(newValue);
    setEmail('');
    setPassword('');
    setKeepLoggedIn(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (tab === 0) {
        // Login
        const result = await login(email, password);
        if (result.success) {
          // Get the user info to check roles
          const userResponse = await api.get('/account/me');
          const userData = userResponse.data;
          
          // Check if user is admin and redirect accordingly
          if (userData.roles && userData.roles.includes('Admin')) {
            nav('/admin/products');
          } else {
            nav('/');
          }
          closeLoginModal();
        } else {
          setError(result.message || 'Login failed');
        }
      } else {
        // Register
        const result = await register(email, password);
        if (result.success) {
          nav('/');
          closeLoginModal();
        } else {
          setError(result.message || 'Registration failed');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    nav('/');
  };

  const handleAdminMenuOpen = (event) => {
    setAdminMenuAnchor(event.currentTarget);
  };

  const handleAdminMenuClose = () => {
    setAdminMenuAnchor(null);
  };

  const handleAdminMenuItemClick = (path) => {
    nav(path);
    handleAdminMenuClose();
  };

  // Determine role and icon color
  const isAdmin = user && hasRole && hasRole('Admin');
  const iconColor = isAdmin ? 'error.main' : 'primary.main';
  const tooltipTitle = isAdmin ? 'Admin' : 'User';

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Left: Logo, Home, About Us */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography component={Link} to="/" variant="h6" sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 700 }}>
            Chilli Milli
          </Typography>
          <Button component={Link} to="/" color="inherit">Home</Button>
          <Button component={Link} to="/about" color="inherit">About Us</Button>
          {isAdmin && (
            <>
              <Button
                color="error"
                variant="outlined"
                startIcon={<AdminPanelSettingsIcon />}
                component={Link}
                to="/admin/products"
                sx={{ fontWeight: 700 }}
              >
                Products
              </Button>
              <Button
                color="error"
                variant="outlined"
                startIcon={<ShoppingBagIcon />}
                component={Link}
                to="/admin/orders"
                sx={{ fontWeight: 700 }}
              >
                Orders
              </Button>
              <Button
                color="error"
                variant="outlined"
                startIcon={<RateReviewIcon />}
                component={Link}
                to="/admin/reviews"
                sx={{ fontWeight: 700 }}
              >
                Reviews
              </Button>
              <Button
                color="error"
                variant="outlined"
                startIcon={<PersonAddIcon />}
                component={Link}
                to="/admin/users"
                sx={{ fontWeight: 700 }}
              >
                Users
              </Button>
            </>
          )}
        </Box>
        {/* Right: Auth buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {user ? (
            <>
              {!isAdmin && (
                <>
                  <Button 
                    component={Link} 
                    to="/orders" 
                    color="inherit" 
                    startIcon={<ShoppingBagIcon />}
                    sx={{ mr: 1 }}
                  >
                    Orders
                  </Button>
                  <Button 
                    component={Link} 
                    to="/reviews" 
                    color="inherit" 
                    startIcon={<RateReviewIcon />}
                    sx={{ mr: 1 }}
                  >
                    Reviews
                  </Button>
                </>
              )}
              <Tooltip title={tooltipTitle} arrow>
                <AccountCircleIcon sx={{ color: iconColor, mr: 1 }} />
              </Tooltip>
              <Typography sx={{ mr: 2, fontWeight: 500 }}>{user.email}</Typography>
              <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" startIcon={<LoginIcon />} onClick={handleOpenLogin}>
                Login
              </Button>
              <Button color="inherit" startIcon={<PersonAddIcon />} onClick={handleOpenLogin}>
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
      {/* Login/Register Modal */}
      <Dialog open={loginModalOpen} onClose={closeLoginModal} maxWidth="xs" fullWidth>
        <Box sx={{ p: 3 }}>
          <Tabs value={tab} onChange={handleTabChange} centered sx={{ mb: 2 }}>
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              required
              autoFocus
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            {tab === 0 && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={keepLoggedIn}
                    onChange={e => setKeepLoggedIn(e.target.checked)}
                    color="primary"
                  />
                }
                label="Keep me logged in"
                sx={{ mt: 1, mb: 1, display: 'block' }}
              />
            )}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3, borderRadius: 3, fontWeight: 700 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} /> : (tab === 0 ? 'Login' : 'Register')}
            </Button>
          </form>
        </Box>
      </Dialog>
    </AppBar>
  );
} 