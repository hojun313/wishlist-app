import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import ItemRow from './ItemRow';

function CategoryCard({ category, onUpdateCategory, onDeleteCategory, onAddItemToCategory, onUpdateItem, onDeleteItem, listType, isReadOnly }) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [categoryName, setCategoryName] = useState(category.name);

  const handleNameChange = (e) => {
    setCategoryName(e.target.value);
  };

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (!isReadOnly && categoryName.trim() !== category.name) {
      onUpdateCategory(category.id, { name: categoryName.trim() });
    }
  };

  const handleAddItem = () => {
    if (isReadOnly) return;
    const newItem = { id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, name: 'New Item' };
    onAddItemToCategory(category.id, newItem);
  };

  return (
    <div style={categoryCardStyle}>
      <div style={cardHeaderStyle}>
        {isEditingName && !isReadOnly ? (
          <input
            type="text"
            value={categoryName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            autoFocus
            style={categoryNameInputStyle}
          />
        ) : (
          <span onClick={() => !isReadOnly && setIsEditingName(true)} style={{ ...categoryNameInputStyle, cursor: isReadOnly ? 'default' : 'pointer' }}>{categoryName}</span>
        )}
        {!isReadOnly && (
          <button style={deleteButtonStyle} onClick={() => onDeleteCategory(category.id)}>🗑️</button>
        )}
      </div>
      <Droppable droppableId={`${listType}-${category.id}`} type="item" isDropDisabled={isReadOnly}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} style={cardBodyStyle}>
            {
              category.items && category.items.map((item, index) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  index={index}
                  categoryId={category.id}
                  onUpdateItem={onUpdateItem}
                  onDeleteItem={onDeleteItem}
                  isReadOnly={isReadOnly}
                />
              ))
            }
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      {!isReadOnly && (
        <button style={addItemButtonStyle} onClick={handleAddItem}>+ Add Item</button>
      )}
    </div>
  );
}

const categoryCardStyle = {
  backgroundColor: '#FFFFFF',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  padding: '15px',
  marginBottom: '20px',
};

const cardHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '10px',
};

const categoryNameInputStyle = {
  border: 'none',
  fontSize: '18px',
  fontWeight: 'bold',
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

const cardBodyStyle = {
  marginBottom: '10px',
};

const cardFooterStyle = {
  textAlign: 'right',
};

const addItemButtonStyle = {
  padding: '8px 12px',
  backgroundColor: '#FF7A50',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
};

export default CategoryCard;