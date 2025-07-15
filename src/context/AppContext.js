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

  const placeOrder = async (orderData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Prepare payment data for backend
      const paymentRequest = {
        paymentMethod: orderData.paymentMethod,
        amount: orderData.total,
        testMode: orderData.testMode,
        paymentData: orderData.paymentData,
        orderDetails: {
          items: orderData.items || state.cart,
          shippingAddress: orderData.shippingAddress,
          total: orderData.total
        }
      };

      // Process payment through backend
      const paymentResponse = await fetch('http://localhost:5000/api/payment/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentRequest)
      });

      if (!paymentResponse.ok) {
        throw new Error('Payment processing failed');
      }

      // Handle SSE response for real-time updates
      const reader = paymentResponse.body.getReader();
      const decoder = new TextDecoder();
      let paymentResult = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.status === 'completed') {
                paymentResult = data;
                break;
              } else if (data.status === 'error') {
                throw new Error(data.message);
              }
              // For progress updates, you could emit events here if needed
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }

        if (paymentResult) break;
      }

      if (!paymentResult || !paymentResult.success) {
        throw new Error(paymentResult?.message || 'Payment failed');
      }

      // Create order object on successful payment
      const order = {
        id: paymentResult.transactionId || Date.now().toString(),
        ...orderData,
        items: orderData.items || [...state.cart],
        total: orderData.total,
        date: new Date().toISOString(),
        status: 'confirmed',
        paymentStatus: 'completed',
        transactionId: paymentResult.transactionId
      };
      
      dispatch({ type: 'ADD_ORDER', payload: order });
      dispatch({ type: 'CLEAR_CART' });
      
      return { 
        success: true, 
        order: order,
        message: 'Order placed successfully!'
      };

    } catch (error) {
      console.error('Order placement error:', error);
      return {
        success: false,
        message: error.message || 'Order placement failed'
      };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
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