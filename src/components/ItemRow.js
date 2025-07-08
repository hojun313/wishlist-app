import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';

function ItemRow({ item, categoryId, onUpdateItem, onDeleteItem, index }) {
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
    <Draggable draggableId={item.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{ ...itemRowStyle, ...provided.draggableProps.style }}
        >
          <span style={dragHandleStyle}>⠿⠿⠿</span>
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
          <button style={deleteButtonStyle} onClick={() => onDeleteItem(categoryId, item.id)}>🗑️</button>
        </div>
      )}
    </Draggable>
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

export default ItemRow;