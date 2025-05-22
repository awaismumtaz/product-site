import React, { useState } from 'react';
import Header from './Header';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, InputBase, IconButton, Paper, Button, Drawer, List, ListItem, ListItemText, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import { useCart } from '../context/CartContext';
import ProductToolbar from './ProductToolbar';

const drawerWidth = 240;

export default function Layout() {
  const nav = useNavigate();
  const location = useLocation();
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const handleDrawerOpen = () => setDrawerOpen(true);
  const handleDrawerClose = () => setDrawerOpen(false);
  const buttonStyles = {
    backgroundColor: 'black',
    color: 'white',
    fontWeight: 700,
    '&:hover': { backgroundColor: '#222' }
  };

  // Get cart data from context
  const { cart } = useCart();
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const articles = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Only show toolbar on homepage ("/")
  const showToolbar = location.pathname === '/';

  return (
    <>
      <Header />
      {showToolbar && <ProductToolbar />}
      {/* Persistent Drawer (sidebar) with X close icon */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={drawerOpen}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            top: 'auto',
            mt: 8 // adjust if needed for header height
          },
        }}
      >
        <Box sx={{ width: drawerWidth, p: 2, position: 'relative' }} role="presentation">
          <IconButton
            onClick={handleDrawerClose}
            sx={{ position: 'absolute', top: 8, right: 8, color: 'grey.700' }}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" sx={{ mb: 2, mt: 0, pr: 4 }}>Categories</Typography>
          <List sx={{ mt: 4 }}>
            <ListItem button>
              <ListItemText primary="Category 1" />
            </ListItem>
            <ListItem button>
              <ListItemText primary="Category 2" />
            </ListItem>
            <ListItem button>
              <ListItemText primary="Category 3" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
      {/* Main content shifts right when drawer is open */}
      <Box sx={{ transition: 'margin-left 0.3s', marginLeft: drawerOpen ? `${drawerWidth}px` : 0 }}>
        <Outlet />
      </Box>
    </>
  );
} 