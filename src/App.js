import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import MainContent from './components/MainContent';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [viewingUserId, setViewingUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      // 로그인 상태가 변경되면 viewingUserId를 현재 사용자의 UID로 초기화
      setViewingUserId(user ? user.uid : null);
    });

    return () => unsubscribe();
  }, []);

  const handleViewSharedList = (userId) => {
    setViewingUserId(userId);
  };

  const handleViewMyList = () => {
    if (currentUser) {
      setViewingUserId(currentUser.uid);
    }
  };

  return (
    <div className="App">
      <Header 
        currentUser={currentUser} 
        onViewSharedList={handleViewSharedList}
        onViewMyList={handleViewMyList}
        isViewingOwnList={currentUser && viewingUserId === currentUser.uid}
      />
      <MainContent 
        currentUser={currentUser} 
        viewingUserId={viewingUserId}
      />
    </div>
  );
}

export default App;
