import React from 'react';

function EmptyState({ message }) {
  return (
    <div style={emptyStateStyle}>
      {message}
    </div>
  );
}

const emptyStateStyle = {
  textAlign: 'center',
  color: '#888',
  padding: '50px 0',
  border: '1px dashed #ccc',
  borderRadius: '8px',
  marginTop: '20px',
  backgroundColor: '#f9f9f9',
};

export default EmptyState;