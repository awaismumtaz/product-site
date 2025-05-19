import { createContext, useContext, useState } from 'react';

// 1. Create context
const CartContext = createContext();

// 2. Provider component
export function CartProvider({ children }) {
  // Load initial cart from localStorage or empty array
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });

  // Save to both state & localStorage
  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.id === product.id);
      let updated;
      if (idx > -1) {
        updated = [...prev];
        updated[idx].quantity += qty;
      } else {
        updated = [...prev, { ...product, quantity: qty }];
      }
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromCart = productId => {
    setCart(prev => {
      const updated = prev.filter(i => i.id !== productId);
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

// 3. Hook to use context
export function useCart() {
  return useContext(CartContext);
}
