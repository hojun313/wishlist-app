import React from 'react';

function Header() {
  return (
    <header style={headerStyle}>
      <div style={logoStyle}>Wishlist Hub</div>
      <div style={buttonGroupStyle}>
        <button style={createListButtonStyle}>+ Create New List</button>
        <button style={authButtonStyle}>Sign In</button>
        <button style={authButtonStyle}>Sign Up</button>
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
  gap: '10px',
};

const createListButtonStyle = {
  padding: '10px 15px',
  backgroundColor: '#FF7A50',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '16px',
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