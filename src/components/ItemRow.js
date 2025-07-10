import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';

function ItemRow({ item, categoryId, onUpdateItem, onDeleteItem, index, isReadOnly }) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [itemName, setItemName] = useState(item.name);

  const handleNameChange = (e) => {
    setItemName(e.target.value);
  };

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (!isReadOnly && itemName.trim() !== item.name) {
      onUpdateItem(categoryId, item.id, itemName.trim());
    }
  };

  return (
    <Draggable draggableId={item.id} index={index} isDragDisabled={isReadOnly}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...(!isReadOnly && provided.dragHandleProps)}
          style={{ ...itemRowStyle, ...provided.draggableProps.style }}
        >
          {!isReadOnly && <div style={dragHandleStyle}>&#x2630;</div>}
          {isEditingName && !isReadOnly ? (
            <input
              type="text"
              value={itemName}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              autoFocus
              style={itemNameInputStyle}
            />
          ) : (
            <span onClick={() => !isReadOnly && setIsEditingName(true)} style={{ ...itemNameInputStyle, cursor: isReadOnly ? 'default' : 'pointer' }}>{itemName}</span>
          )}
          <div style={itemActionsStyle}>
            {!isReadOnly && (
              <button style={deleteButtonStyle} onClick={() => onDeleteItem(categoryId, item.id)}>🗑️</button>
            )}
          </div>
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