import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import CategoryCard from './CategoryCard';
import EmptyState from './EmptyState';

function MainContent() {
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' or 'view'
  const [hobbies, setHobbies] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      // Fetch Hobbies
      const hobbiesSnapshot = await getDocs(collection(db, "hobbies"));
      const hobbiesList = hobbiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHobbies(hobbiesList);

      // Fetch Wishlist
      const wishlistSnapshot = await getDocs(collection(db, "wishlist"));
      const wishlistList = wishlistSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWishlist(wishlistList);
    };
    fetchCategories();
  }, []);

  const handleAddCategory = async (type) => {
    const newCategory = { name: `New Category ${type === 'hobbies' ? hobbies.length + 1 : wishlist.length + 1}`, items: [], order: type === 'hobbies' ? hobbies.length : wishlist.length };
    try {
      const collectionRef = collection(db, type);
      const docRef = await addDoc(collectionRef, newCategory);
      if (type === 'hobbies') {
        setHobbies([...hobbies, { id: docRef.id, ...newCategory }]);
      } else {
        setWishlist([...wishlist, { id: docRef.id, ...newCategory }]);
      }
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const handleUpdateCategory = async (id, updatedFields, type) => {
    try {
      const categoryRef = doc(db, type, id);
      await updateDoc(categoryRef, updatedFields);
      if (type === 'hobbies') {
        setHobbies(hobbies.map(cat => (cat.id === id ? { ...cat, ...updatedFields } : cat)));
      } else {
        setWishlist(wishlist.map(cat => (cat.id === id ? { ...cat, ...updatedFields } : cat)));
      }
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };

  const handleDeleteCategory = async (id, type) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteDoc(doc(db, type, id));
        if (type === 'hobbies') {
          setHobbies(hobbies.filter(cat => cat.id !== id));
        } else {
          setWishlist(wishlist.filter(cat => cat.id !== id));
        }
      } catch (e) {
        console.error("Error deleting document: ", e);
      }
    }
  };

  const handleAddItemToCategory = async (categoryId, item, type) => {
    try {
      const categoryRef = doc(db, type, categoryId);
      const currentCategory = (type === 'hobbies' ? hobbies : wishlist).find(cat => cat.id === categoryId);
      const updatedItems = [...(currentCategory.items || []), item];
      await updateDoc(categoryRef, { items: updatedItems });

      if (type === 'hobbies') {
        setHobbies(hobbies.map(cat => (cat.id === categoryId ? { ...cat, items: updatedItems } : cat)));
      } else {
        setWishlist(wishlist.map(cat => (cat.id === categoryId ? { ...cat, items: updatedItems } : cat)));
      }
    } catch (e) {
      console.error("Error adding item to category: ", e);
    }
  };

  const handleUpdateItem = async (categoryId, itemId, newItemName, type) => {
    try {
      const categoryRef = doc(db, type, categoryId);
      const currentCategory = (type === 'hobbies' ? hobbies : wishlist).find(cat => cat.id === categoryId);
      const updatedItems = (currentCategory.items || []).map(item => 
        item.id === itemId ? { ...item, name: newItemName } : item
      );
      await updateDoc(categoryRef, { items: updatedItems });

      if (type === 'hobbies') {
        setHobbies(hobbies.map(cat => (cat.id === categoryId ? { ...cat, items: updatedItems } : cat)));
      } else {
        setWishlist(wishlist.map(cat => (cat.id === categoryId ? { ...cat, items: updatedItems } : cat)));
      }
    } catch (e) {
      console.error("Error updating item: ", e);
    }
  };

  const handleDeleteItem = async (categoryId, itemId, type) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        const categoryRef = doc(db, type, categoryId);
        const currentCategory = (type === 'hobbies' ? hobbies : wishlist).find(cat => cat.id === categoryId);
        const updatedItems = (currentCategory.items || []).filter(item => item.id !== itemId);
        await updateDoc(categoryRef, { items: updatedItems });

        if (type === 'hobbies') {
          setHobbies(hobbies.map(cat => (cat.id === categoryId ? { ...cat, items: updatedItems } : cat)));
        } else {
          setWishlist(wishlist.map(cat => (cat.id === categoryId ? { ...cat, items: updatedItems } : cat)));
        }
      } catch (e) {
        console.error("Error deleting item: ", e);
      }
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // If dropped in the same place
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Reordering categories within the same column
    if (source.droppableId === destination.droppableId) {
      const columnType = source.droppableId; // 'hobbies' or 'wishlist'
      const items = columnType === 'hobbies' ? Array.from(hobbies) : Array.from(wishlist);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);

      if (columnType === 'hobbies') {
        setHobbies(items);
      } else {
        setWishlist(items);
      }

      // Update order in Firestore
      const batch = writeBatch(db);
      items.forEach((item, index) => {
        const categoryRef = doc(db, columnType, item.id);
        batch.update(categoryRef, { order: index });
      });
      await batch.commit();
    } else { // Moving item within a category
      const sourceColumnType = source.droppableId.split('-')[0]; // e.g., 'hobbies'
      const sourceCategoryId = source.droppableId.split('-')[1];

      const destinationColumnType = destination.droppableId.split('-')[0];
      const destinationCategoryId = destination.droppableId.split('-')[1];

      // Ensure it's an item reorder within a category
      if (sourceColumnType === destinationColumnType && sourceCategoryId === destinationCategoryId) {
        const currentCategories = sourceColumnType === 'hobbies' ? Array.from(hobbies) : Array.from(wishlist);
        const categoryToUpdate = currentCategories.find(cat => cat.id === sourceCategoryId);

        if (categoryToUpdate) {
          const updatedItems = Array.from(categoryToUpdate.items || []);
          const [reorderedItem] = updatedItems.splice(source.index, 1);
          updatedItems.splice(destination.index, 0, reorderedItem);

          // Update local state
          if (sourceColumnType === 'hobbies') {
            setHobbies(hobbies.map(cat => (cat.id === sourceCategoryId ? { ...cat, items: updatedItems } : cat)));
          } else {
            setWishlist(wishlist.map(cat => (cat.id === sourceCategoryId ? { ...cat, items: updatedItems } : cat)));
          }

          // Update Firestore
          const categoryRef = doc(db, sourceColumnType, sourceCategoryId);
          await updateDoc(categoryRef, { items: updatedItems });
        }
      }
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={mainContentStyle}>
        <div style={tabMenuStyle}>
          <button
            style={{ ...tabButtonStyle, ...(activeTab === 'edit' ? activeTabButtonStyle : {}) }}
            onClick={() => setActiveTab('edit')}
          >
            Edit Lists
          </button>
          <button
            style={{ ...tabButtonStyle, ...(activeTab === 'view' ? activeTabButtonStyle : {}) }}
            onClick={() => setActiveTab('view')}
          >
            View Lists
          </button>
        </div>

        <div style={columnsContainerStyle}>
          {/* My Hobbies Column */}
          <Droppable droppableId="hobbies">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={columnStyle}
              >
                <h2 style={columnTitleStyle}>My Hobbies</h2>
                {hobbies.length === 0 ? (
                  <EmptyState message="No categories yet. Add one to get started!" />
                ) : (
                  hobbies.map((category, index) => (
                    <Draggable key={category.id} draggableId={category.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <CategoryCard
                            category={category}
                            listType="hobbies"
                            onUpdateCategory={(id, updatedFields) => handleUpdateCategory(id, updatedFields, 'hobbies')}
                            onDeleteCategory={(id) => handleDeleteCategory(id, 'hobbies')}
                            onAddItemToCategory={(categoryId, item) => handleAddItemToCategory(categoryId, item, 'hobbies')}
                            onUpdateItem={(categoryId, itemId, newItemName) => handleUpdateItem(categoryId, itemId, newItemName, 'hobbies')}
                            onDeleteItem={(categoryId, itemId) => handleDeleteItem(categoryId, itemId, 'hobbies')}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
                <button style={addCategoryButtonStyle} onClick={() => handleAddCategory('hobbies')}>+ Add Category</button>
              </div>
            )}
          </Droppable>

          {/* My Wishlist Column */}
          <Droppable droppableId="wishlist">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={columnStyle}
              >
                <h2 style={columnTitleStyle}>My Wishlist</h2>
                {wishlist.length === 0 ? (
                  <EmptyState message="No categories yet. Add one to get started!" />
                ) : (
                  wishlist.map((category, index) => (
                    <Draggable key={category.id} draggableId={category.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <CategoryCard
                            category={category}
                            listType="wishlist"
                            onUpdateCategory={(id, updatedFields) => handleUpdateCategory(id, updatedFields, 'wishlist')}
                            onDeleteCategory={(id) => handleDeleteCategory(id, 'wishlist')}
                            onAddItemToCategory={(categoryId, item) => handleAddItemToCategory(categoryId, item, 'wishlist')}
                            onUpdateItem={(categoryId, itemId, newItemName) => handleUpdateItem(categoryId, itemId, newItemName, 'wishlist')}
                            onDeleteItem={(categoryId, itemId) => handleDeleteItem(categoryId, itemId, 'wishlist')}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
                <button style={addCategoryButtonStyle} onClick={() => handleAddCategory('wishlist')}>+ Add Category</button>
              </div>
            )}
          </Droppable>
        </div>
      </div>
    </DragDropContext>
  );
}

const mainContentStyle = {
  padding: '20px',
  backgroundColor: '#F7F8FA',
  minHeight: 'calc(100vh - 80px)', // Adjust based on header height
};

const tabMenuStyle = {
  display: 'flex',
  marginBottom: '20px',
};

const tabButtonStyle = {
  padding: '10px 20px',
  border: '1px solid #ccc',
  backgroundColor: '#fff',
  cursor: 'pointer',
  fontSize: '16px',
  borderRadius: '5px',
  marginRight: '10px',
};

const activeTabButtonStyle = {
  backgroundColor: '#007bff',
  color: 'white',
  borderColor: '#007bff',
};

const columnsContainerStyle = {
  display: 'flex',
  gap: '20px',
};

const columnStyle = {
  flex: 1,
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const columnTitleStyle = {
  fontSize: '22px',
  marginBottom: '15px',
  color: '#333',
};

const addCategoryButtonStyle = {
  padding: '10px 15px',
  backgroundColor: '#FF7A50',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '16px',
  marginTop: '20px',
  width: '100%',
};

const emptyStateStyle = {
  textAlign: 'center',
  color: '#888',
  padding: '50px 0',
  border: '1px dashed #ccc',
  borderRadius: '8px',
  marginTop: '20px',
};

export default MainContent;