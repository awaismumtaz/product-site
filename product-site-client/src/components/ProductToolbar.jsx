import React, { useState } from 'react';
import { Box, InputBase, IconButton, Paper, Button, Drawer, List, ListItem, ListItemText, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

export default function ProductToolbar() {
  const nav = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const handleDrawerClose = () => setDrawerOpen(false);
  const { user } = useAuth();
  const buttonStyles = {
    backgroundColor: 'black',
    color: 'white',
    fontWeight: 700,
    '&:hover': { backgroundColor: '#222' }
  };
  const { cart } = useCart();
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const articles = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCartClick = () => {
    if (user) {
      nav('/cart');
    } else {
      nav('/login');
    }
  };

  return (
    <>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'row', 
        alignItems: 'center', 
        px: { xs: 1, md: 4 }, 
        mt: 2, 
        mb: 2,
        gap: 2,
        width: '100%',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1, maxWidth: 'calc(100% - 180px)' }}>
          <Button
            variant="contained"
            onClick={() => setDrawerOpen(open => !open)}
            sx={{
              borderRadius: '50%',
              minWidth: 48,
              width: 48,
              height: 48,
              p: 0,
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              ...buttonStyles
            }}
          >
            Menu
          </Button>
          <Paper sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 1, 
            flexGrow: 1,
            bgcolor: 'black',
            borderRadius: '25px',
            '.MuiInputBase-root': {
              color: 'white'
            },
            '.MuiInputBase-input::placeholder': {
              color: 'grey.400',
              opacity: 1
            }
          }}>
            <InputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
              sx={{ ml: 1, flex: 1 }}
            />
            <IconButton 
              type="submit" 
              sx={{ 
                p: '10px',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }} 
              aria-label="search"
            >
              <SearchIcon />
            </IconButton>
          </Paper>
        </Box>
        <Button
          variant="contained"
          startIcon={<ShoppingCartIcon />}
          sx={{
            ml: 2,
            px: 3,
            py: 1.5,
            borderRadius: '25px',
            fontWeight: 700,
            fontSize: '1.1rem',
            boxShadow: 3,
            textTransform: 'none',
            minWidth: 160,
            flexShrink: 0,
            bgcolor: 'error.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'error.dark'
            }
          }}
          onClick={handleCartClick}
        >
          {articles} | ${totalPrice.toFixed(2)}
        </Button>
      </Box>
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
    </>
  );
} 