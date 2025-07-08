import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import CategoryCard from './CategoryCard';
import EmptyState from './EmptyState';

function MainContent() {
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' or 'view'
  const [interests, setInterests] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      // Fetch Hobbies
      const interestsSnapshot = await getDocs(collection(db, "interests"));
      const interestsList = interestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInterests(interestsList);

      // Fetch Wishlist
      const wishlistSnapshot = await getDocs(collection(db, "wishlist"));
      const wishlistList = wishlistSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWishlist(wishlistList);
    };
    fetchCategories();
  }, []);

  const handleAddCategory = async (type) => {
    const newCategory = { name: `New Category ${type === 'interests' ? interests.length + 1 : wishlist.length + 1}`, items: [], order: type === 'interests' ? interests.length : wishlist.length };
    try {
      const collectionRef = collection(db, type);
      const docRef = await addDoc(collectionRef, newCategory);
      if (type === 'interests') {
        setInterests([...interests, { id: docRef.id, ...newCategory }]);
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
      if (type === 'interests') {
        setInterests(interests.map(cat => (cat.id === id ? { ...cat, ...updatedFields } : cat)));
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
        if (type === 'interests') {
          setInterests(interests.filter(cat => cat.id !== id));
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
      const currentCategory = (type === 'interests' ? interests : wishlist).find(cat => cat.id === categoryId);
      const updatedItems = [...(currentCategory.items || []), item];
      await updateDoc(categoryRef, { items: updatedItems });

      if (type === 'interests') {
        setInterests(interests.map(cat => (cat.id === categoryId ? { ...cat, items: updatedItems } : cat)));
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
      const currentCategory = (type === 'interests' ? interests : wishlist).find(cat => cat.id === categoryId);
      const updatedItems = (currentCategory.items || []).map(item => 
        item.id === itemId ? { ...item, name: newItemName } : item
      );
      await updateDoc(categoryRef, { items: updatedItems });

      if (type === 'interests') {
        setInterests(interests.map(cat => (cat.id === categoryId ? { ...cat, items: updatedItems } : cat)));
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
        const currentCategory = (type === 'interests' ? interests : wishlist).find(cat => cat.id === categoryId);
        const updatedItems = (currentCategory.items || []).filter(item => item.id !== itemId);
        await updateDoc(categoryRef, { items: updatedItems });

        if (type === 'interests') {
          setInterests(interests.map(cat => (cat.id === categoryId ? { ...cat, items: updatedItems } : cat)));
        } else {
          setWishlist(wishlist.map(cat => (cat.id === categoryId ? { ...cat, items: updatedItems } : cat)));
        }
      } catch (e) {
        console.error("Error deleting item: ", e);
      }
    }
  };

  const handleMoveItem = async (categoryId, itemIndex, direction, type) => {
    const currentCategories = type === 'interests' ? Array.from(interests) : Array.from(wishlist);
    const categoryToUpdate = currentCategories.find(cat => cat.id === categoryId);

    if (categoryToUpdate) {
      const updatedItems = Array.from(categoryToUpdate.items || []);
      const [movedItem] = updatedItems.splice(itemIndex, 1);
      const newIndex = itemIndex + direction;

      if (newIndex >= 0 && newIndex < updatedItems.length + 1) {
        updatedItems.splice(newIndex, 0, movedItem);

        // Update local state
        if (type === 'interests') {
          setInterests(interests.map(cat => (cat.id === categoryId ? { ...cat, items: updatedItems } : cat)));
        } else {
          setWishlist(wishlist.map(cat => (cat.id === categoryId ? { ...cat, items: updatedItems } : cat)));
        }

        // Update Firestore
        const categoryRef = doc(db, type, categoryId);
        await updateDoc(categoryRef, { items: updatedItems });
      }
    }
  };

  const handleMoveItemUp = (categoryId, itemIndex, type) => {
    handleMoveItem(categoryId, itemIndex, -1, type);
  };

  const handleMoveItemDown = (categoryId, itemIndex, type) => {
    handleMoveItem(categoryId, itemIndex, 1, type);
  };

  return (
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
        {/* My Interests Column */}
        <div
          style={columnStyle}
        >
          <h2 style={columnTitleStyle}>My Interests</h2>
          {interests.length === 0 ? (
            <EmptyState message="No categories yet. Add one to get started!" />
          ) : (
            interests.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                listType="interests"
                onUpdateCategory={(id, updatedFields) => handleUpdateCategory(id, updatedFields, 'interests')}
                onDeleteCategory={(id) => handleDeleteCategory(id, 'interests')}
                onAddItemToCategory={(categoryId, item) => handleAddItemToCategory(categoryId, item, 'interests')}
                onUpdateItem={(categoryId, itemId, newItemName) => handleUpdateItem(categoryId, itemId, newItemName, 'interests')}
                onDeleteItem={(categoryId, itemId) => handleDeleteItem(categoryId, itemId, 'interests')}
                onMoveItemUp={(categoryId, itemIndex) => handleMoveItemUp(categoryId, itemIndex, 'interests')}
                onMoveItemDown={(categoryId, itemIndex) => handleMoveItemDown(categoryId, itemIndex, 'interests')}
              />
            ))
          )}
          <button style={addCategoryButtonStyle} onClick={() => handleAddCategory('interests')}>+ Add Category</button>
        </div>

        {/* My Wishlist Column */}
        <div
          style={columnStyle}
        >
          <h2 style={columnTitleStyle}>My Wishlist</h2>
          {wishlist.length === 0 ? (
            <EmptyState message="No categories yet. Add one to get started!" />
          ) : (
            wishlist.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                listType="wishlist"
                onUpdateCategory={(id, updatedFields) => handleUpdateCategory(id, updatedFields, 'wishlist')}
                onDeleteCategory={(id) => handleDeleteCategory(id, 'wishlist')}
                onAddItemToCategory={(categoryId, item) => handleAddItemToCategory(categoryId, item, 'wishlist')}
                onUpdateItem={(categoryId, itemId, newItemName) => handleUpdateItem(categoryId, itemId, newItemName, 'wishlist')}
                onDeleteItem={(categoryId, itemId) => handleDeleteItem(categoryId, itemId, 'wishlist')}
                onMoveItemUp={(categoryId, itemIndex) => handleMoveItemUp(categoryId, itemIndex, 'wishlist')}
                onMoveItemDown={(categoryId, itemIndex) => handleMoveItemDown(categoryId, itemIndex, 'wishlist')}
              />
            ))
          )}
          <button style={addCategoryButtonStyle} onClick={() => handleAddCategory('wishlist')}>+ Add Category</button>
        </div>
      </div>
    </div>
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