import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

const Auth = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const [mode, setMode] = useState(defaultMode);

  if (!isOpen) return null;

  const switchToLogin = () => setMode('login');
  const switchToRegister = () => setMode('register');

  return (
    <>
      {mode === 'login' ? (
        <Login onClose={onClose} switchToRegister={switchToRegister} />
      ) : (
        <Register onClose={onClose} switchToLogin={switchToLogin} />
      )}
    </>
  );
};

export default Auth;