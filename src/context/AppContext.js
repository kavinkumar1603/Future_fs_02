import React, { createContext, useContext, useReducer } from 'react';
import { toast } from 'react-hot-toast';

const AppContext = createContext();

const initialState = {
  user: JSON.parse(localStorage.getItem('fitProUser')) || null,
  cart: JSON.parse(localStorage.getItem('fitProCart')) || [],
  orders: JSON.parse(localStorage.getItem('fitProOrders')) || [],
  isLoading: false
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'LOGIN_USER':
      localStorage.setItem('fitProUser', JSON.stringify(action.payload));
      return { ...state, user: action.payload };
    
    case 'LOGOUT_USER':
      localStorage.removeItem('fitProUser');
      localStorage.removeItem('fitProCart');
      return { ...state, user: null, cart: [] };
    
    case 'ADD_TO_CART':
      const existingItem = state.cart.find(item => item.id === action.payload.id);
      let newCart;
      
      if (existingItem) {
        newCart = state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newCart = [...state.cart, { ...action.payload, quantity: 1 }];
      }
      
      localStorage.setItem('fitProCart', JSON.stringify(newCart));
      return { ...state, cart: newCart };
    
    case 'REMOVE_FROM_CART':
      const filteredCart = state.cart.filter(item => item.id !== action.payload);
      localStorage.setItem('fitProCart', JSON.stringify(filteredCart));
      return { ...state, cart: filteredCart };
    
    case 'UPDATE_CART_QUANTITY':
      const updatedCart = state.cart.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0);
      
      localStorage.setItem('fitProCart', JSON.stringify(updatedCart));
      return { ...state, cart: updatedCart };
    
    case 'CLEAR_CART':
      localStorage.removeItem('fitProCart');
      return { ...state, cart: [] };
    
    case 'ADD_ORDER':
      const newOrders = [...state.orders, action.payload];
      localStorage.setItem('fitProOrders', JSON.stringify(newOrders));
      return { ...state, orders: newOrders };
    
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Actions
  const loginUser = (userData) => {
    dispatch({ type: 'LOGIN_USER', payload: userData });
    toast.success(`Welcome back, ${userData.name}!`);
  };

  const logoutUser = () => {
    dispatch({ type: 'LOGOUT_USER' });
    toast.success('Logged out successfully!');
  };

  const addToCart = (product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
    toast.success('Added to cart!');
  };

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
    toast.success('Removed from cart!');
  };

  const updateCartQuantity = (productId, quantity) => {
    dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { id: productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const placeOrder = (orderData) => {
    const order = {
      id: Date.now().toString(),
      ...orderData,
      items: [...state.cart],
      total: state.cart.reduce((total, item) => total + (item.price * item.quantity), 0),
      date: new Date().toISOString(),
      status: 'confirmed'
    };
    
    dispatch({ type: 'ADD_ORDER', payload: order });
    dispatch({ type: 'CLEAR_CART' });
    toast.success('Order placed successfully!');
    return order;
  };

  const cartTotal = state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartItemsCount = state.cart.reduce((total, item) => total + item.quantity, 0);

  const value = {
    ...state,
    loginUser,
    logoutUser,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    placeOrder,
    cartTotal,
    cartItemsCount
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};