import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

// 1. Create context
const CartContext = createContext();

// Helper function to normalize cart item properties
const normalizeCartItem = (product, qty) => ({
  id: Number(product.id),
  name: String(product.name),
  price: Number(product.price),
  quantity: Number(qty)
});

// 2. Provider component
export function CartProvider({ children }) {
  // Load initial cart from localStorage or empty array
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem('cart');
      if (!stored) return [];
      
      // Parse and normalize the stored cart items
      const parsedCart = JSON.parse(stored);
      return Array.isArray(parsedCart) 
        ? parsedCart.map(item => normalizeCartItem(item, item.quantity))
        : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  });

  // Re-normalize cart on mount to ensure consistent data types
  useEffect(() => {
    if (cart.length > 0) {
      const normalizedCart = cart.map(item => normalizeCartItem(item, item.quantity));
      setCart(normalizedCart);
      
      try {
        localStorage.setItem('cart', JSON.stringify(normalizedCart));
      } catch (error) {
        console.error('Error saving normalized cart to localStorage:', error);
      }
    }
  }, []);

  // Save to both state & localStorage
  const addToCart = async (product, qty = 1) => {
    // Fetch latest product data to verify stock and price
    try {
      const { data: current } = await api.get(`/products/${product.id}`);

      // Verify price hasn't changed
      if (current.price !== product.price) {
        alert('Product price has changed. Please refresh the page.');
        return false;
      }

      // Calculate total quantity including what's already in cart
      const inCart = cart.find(i => i.id === product.id)?.quantity || 0;
      const totalQty = inCart + Number(qty);

      // Verify stock
      if (totalQty > current.stock) {
        alert(`Sorry, only ${current.stock} items available`);
        return false;
      }

      setCart(prev => {
        const idx = prev.findIndex(i => i.id === product.id);
        let updated;
        
        if (idx > -1) {
          updated = [...prev];
          updated[idx] = normalizeCartItem(
            updated[idx], 
            Number(updated[idx].quantity) + Number(qty)
          );
        } else {
          updated = [...prev, normalizeCartItem(product, qty)];
        }
        
        try {
          localStorage.setItem('cart', JSON.stringify(updated));
        } catch (error) {
          console.error('Error saving cart to localStorage:', error);
        }
        
        return updated;
      });

      return true;
    } catch (error) {
      console.error('Error verifying product:', error);
      alert('Failed to add item to cart. Please try again.');
      return false;
    }
  };

  const removeFromCart = productId => {
    setCart(prev => {
      const updated = prev.filter(i => i.id !== productId);
      try {
        localStorage.setItem('cart', JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem('cart');
    } catch (error) {
      console.error('Error clearing cart from localStorage:', error);
    }
  };

  // Update quantity of a cart item
  const updateQuantity = (productId, newQty) => {
    if (newQty < 1) return;
    setCart(prev => {
      const updated = prev.map(item =>
        item.id === productId ? { ...item, quantity: newQty } : item
      );
      try {
        localStorage.setItem('cart', JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
      return updated;
    });
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
}

// 3. Hook to use context
export function useCart() {
  return useContext(CartContext);
}
