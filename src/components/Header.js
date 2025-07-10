import React from 'react';
import { auth, provider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';

function Header({ currentUser }) {
  const handleSignIn = () => {
    signInWithPopup(auth, provider).catch(error => console.error(error));
  };

  const handleSignOut = () => {
    signOut(auth).catch(error => console.error(error));
  };

  return (
    <header style={headerStyle}>
      <div style={logoStyle}>Wishlist Hub</div>
      <div style={buttonGroupStyle}>
        {currentUser ? (
          <>
            <span style={welcomeMessageStyle}>Welcome, {currentUser.displayName || 'User'}!</span>
            <button onClick={handleSignOut} style={authButtonStyle}>Sign Out</button>
          </>
        ) : (
          <button onClick={handleSignIn} style={authButtonStyle}>Sign In with Google</button>
        )}
      </div>
    </header>
  );
}

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px',
  backgroundColor: '#f8f9fa',
  borderBottom: '1px solid #e0e0e0',
};

const logoStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#333',
};

const buttonGroupStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
};

const welcomeMessageStyle = {
  fontSize: '16px',
  color: '#333',
};

const authButtonStyle = {
  padding: '10px 15px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '16px',
};

export default Header;