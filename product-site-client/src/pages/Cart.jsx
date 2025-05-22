import { useState, useMemo } from 'react';
import {
  Container, Typography, Paper, IconButton, Button, Box, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nav = useNavigate();
  const { user, openLoginModal } = useAuth();

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const handleIncrease = async (item) => {
    setError('');
    try {
      const { data: product } = await api.get(`/products/${item.id}`);
      if (item.quantity + 1 > product.stock) {
        setError(`Only ${product.stock} units of "${product.name}" available`);
        return;
      }
      updateQuantity(item.id, item.quantity + 1);
    } catch (e) {
      setError('Failed to check stock. Please try again.');
    }
  };

  const handleDecrease = (item) => {
    setError('');
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    } else {
      removeFromCart(item.id);
    }
  };

  const handleOrder = async () => {
    if (!user) {
      openLoginModal();
      return;
    }
    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      // Validate stock and price for each item
      for (const item of cart) {
        const { data: product } = await api.get(`/products/${item.id}`);
        if (product.stock < item.quantity) {
          throw new Error(`Only ${product.stock} units of "${product.name}" available`);
        }
        // Compare prices with a small tolerance for floating-point arithmetic
        if (Math.abs(product.price - item.price) > 0.001) {
          throw new Error(`Price of "${product.name}" has changed. Please refresh your cart.`);
        }
      }
      // Place order
      await api.post('/orders', cart.map(({ id, name, price, quantity }) => ({ 
        id, 
        name,
        price,
        quantity 
      })));
      clearCart();
      nav('/orders');
    } catch (e) {
      setError(e.response?.data || e.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <Container sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>Your Cart</Typography>
        <Alert severity="info">Your cart is empty.</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 6 }}>
      <Typography variant="h5" gutterBottom>Your Cart</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="center">Quantity</TableCell>
              <TableCell align="right">Subtotal</TableCell>
              <TableCell align="center">Remove</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cart.map(item => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleDecrease(item)} disabled={isSubmitting}>
                    <RemoveIcon />
                  </IconButton>
                  <span style={{ margin: '0 8px', minWidth: 24, display: 'inline-block', textAlign: 'center' }}>{item.quantity}</span>
                  <IconButton size="small" onClick={() => handleIncrease(item)} disabled={isSubmitting}>
                    <AddIcon />
                  </IconButton>
                </TableCell>
                <TableCell align="right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => removeFromCart(item.id)} color="error" disabled={isSubmitting}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={3} align="right" sx={{ fontWeight: 700 }}>Total</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>${total.toFixed(2)}</TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="outlined" color="error" onClick={clearCart} disabled={isSubmitting}>
          Clear Cart
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOrder}
          disabled={isSubmitting}
        >
          {isSubmitting ? <CircularProgress size={24} /> : 'Place Order'}
        </Button>
      </Box>
    </Container>
  );
}
