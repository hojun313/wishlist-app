import React from 'react';

function ItemCard({ item }) {
  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px', borderRadius: '5px' }}>
      <h3>{item.name}</h3>
      <p>{item.description}</p>
      {item.category && <p>Category: {item.category}</p>}
    </div>
  );
}

export default ItemCard;