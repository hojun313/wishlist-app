import React, { useState } from 'react';

function ItemRow({ item, categoryId, onUpdateItem, onDeleteItem, onMoveItemUp, onMoveItemDown, index, totalItems }) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [itemName, setItemName] = useState(item.name);

  const handleNameChange = (e) => {
    setItemName(e.target.value);
  };

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (itemName.trim() !== item.name) {
      onUpdateItem(categoryId, item.id, itemName.trim());
    }
  };

  return (
    <div style={itemRowStyle}>
      {isEditingName ? (
        <input
          type="text"
          value={itemName}
          onChange={handleNameChange}
          onBlur={handleNameBlur}
          autoFocus
          style={itemNameInputStyle}
        />
      ) : (
        <span onClick={() => setIsEditingName(true)} style={itemNameInputStyle}>{itemName}</span>
      )}
      <div style={itemActionsStyle}>
        <button
          onClick={() => onMoveItemUp(categoryId, index)}
          disabled={index === 0}
          style={moveButtonStyle}
        >
          ⬆️
        </button>
        <button
          onClick={() => onMoveItemDown(categoryId, index)}
          disabled={index === totalItems - 1}
          style={moveButtonStyle}
        >
          ⬇️
        </button>
        <button style={deleteButtonStyle} onClick={() => onDeleteItem(categoryId, item.id)}>🗑️</button>
      </div>
    </div>
  );
}

const itemRowStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '8px 0',
  borderBottom: '1px solid #eee',
};

const dragHandleStyle = {
  marginRight: '10px',
  cursor: 'grab',
  color: '#888',
};

const itemNameInputStyle = {
  border: 'none',
  flexGrow: 1,
  padding: '5px',
  cursor: 'pointer',
};

const deleteButtonStyle = {
  background: 'none',
  border: 'none',
  color: '#E74C3C',
  fontSize: '18px',
  cursor: 'pointer',
};

const itemActionsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
};

const moveButtonStyle = {
  background: 'none',
  border: '1px solid #ccc',
  borderRadius: '4px',
  padding: '4px 8px',
  cursor: 'pointer',
  fontSize: '12px',
};

export default ItemRow;