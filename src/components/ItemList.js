import React from 'react';
import ItemCard from './ItemCard';

function ItemList({ items }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}

export default ItemList;