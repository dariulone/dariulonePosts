import React from 'react';
import Login from './Login';
import Register from './Register';

const AuthModal = ({ onClose, toggleForm, isLogin }) => {
  return (
    <>
      {isLogin ? (
        <Login onClose={onClose} toggleForm={toggleForm} />
      ) : (
        <Register onClose={onClose} toggleForm={toggleForm} />
      )}
    </>
  );
};

export default AuthModal;
