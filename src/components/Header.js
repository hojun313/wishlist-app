import React, { useState } from 'react';
import { auth, provider, db } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';

function Header({ currentUser, onViewSharedList, onViewMyList, isViewingOwnList }) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCodeInputModal, setShowCodeInputModal] = useState(false);
  const [shareCode, setShareCode] = useState('');
  const [inputCode, setInputCode] = useState('');

  const handleSignIn = () => {
    signInWithPopup(auth, provider).catch(error => console.error(error));
  };

  const handleSignOut = () => {
    signOut(auth).catch(error => console.error(error));
  };

  const generateShareCode = async () => {
    alert("Share feature is temporarily disabled due to a persistent permission issue. Please try again later.");
    return;

    // console.log("generateShareCode called. currentUser:", currentUser); // Added for debugging
    // if (!currentUser) return;

    // const shareCodesCollectionRef = collection(db, 'shareCodes');
    // const q = query(shareCodesCollectionRef, where('userId', '==', currentUser.uid));
    // const querySnapshot = await getDocs(q);

    // let codeToUse = '';

    // if (!querySnapshot.empty) {
    //   // Code already exists for this user
    //   codeToUse = querySnapshot.docs[0].id; // The document ID is the share code
    // } else {
    //   // No existing code, generate a new one
    //   let newCode = '';
    //   let codeExists = true;
    //   while (codeExists) {
    //     newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    //     const docSnap = await getDoc(doc(db, 'shareCodes', newCode));
    //     codeExists = docSnap.exists();
    //   }
    //   codeToUse = newCode;
    //   const shareCodeRef = doc(db, 'shareCodes', codeToUse);
    //   await setDoc(shareCodeRef, { userId: currentUser.uid });
    // }

    // // Set user's list as publicly viewable
    // const userDocRef = doc(db, 'users', currentUser.uid);
    // console.log("Attempting to set isPubliclyViewable for userDocRef:", userDocRef.path); // Added for debugging
    // await setDoc(userDocRef, { isPubliclyViewable: true }, { merge: true });

    // setShareCode(codeToUse);
    // setShowShareModal(true);
  };

  const handleViewCode = async () => {
    if (!inputCode) return;
    const shareCodeRef = doc(db, 'shareCodes', inputCode);
    const docSnap = await getDoc(shareCodeRef);

    if (docSnap.exists()) {
      onViewSharedList(docSnap.data().userId);
      setShowCodeInputModal(false);
    } else {
      alert('Invalid code');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareCode);
    alert('Code copied to clipboard!');
  };

  return (
    <>
      <header style={headerStyle}>
        <div style={logoStyle}>Wishlist Hub</div>
        <div style={buttonGroupStyle}>
          <button onClick={() => setShowCodeInputModal(true)} style={secondaryButtonStyle}>Enter Code</button>
          {currentUser && !isViewingOwnList && (
            <button onClick={onViewMyList} style={secondaryButtonStyle}>My List</button>
          )}
          {currentUser && (
            <button onClick={generateShareCode} style={secondaryButtonStyle}>Share</button>
          )}
          {currentUser ? (
            <>
              <span style={welcomeMessageStyle}>Welcome, {currentUser.displayName || 'User'}!</span>
              <button onClick={handleSignOut} style={authButtonStyle}>Sign Out</button>
            </>
          ) : (
            <button onClick={handleSignIn} style={authButtonStyle}>Sign In with Google</button>
          )}
        </div>
      </header>

      {showShareModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2>Share Your Wishlist</h2>
            <p>Share this code with others to let them view your list:</p>
            <div style={shareCodeStyle}>
              <span>{shareCode}</span>
              <button onClick={copyToClipboard}>Copy</button>
            </div>
            <button onClick={() => setShowShareModal(false)}>Close</button>
          </div>
        </div>
      )}

      {showCodeInputModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2>View a Wishlist</h2>
            <input 
              type="text" 
              placeholder="Enter share code" 
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              style={inputStyle}
            />
            <button onClick={handleViewCode}>View</button>
            <button onClick={() => setShowCodeInputModal(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px',
  backgroundColor: '#f8f9fa',
  borderBottom: '1px solid #e0e0e0',
  position: 'relative',
  zIndex: 1000,
};

const logoStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#333',
};

const buttonGroupStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
};

const welcomeMessageStyle = {
  fontSize: '16px',
  color: '#333',
};

const authButtonStyle = {
  padding: '10px 15px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '16px',
};

const secondaryButtonStyle = {
  padding: '10px 15px',
  backgroundColor: '#6c757d',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '16px',
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 2000,
};

const modalContentStyle = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
};

const shareCodeStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginTop: '10px',
  padding: '8px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  backgroundColor: '#f0f0f0',
};

const inputStyle = {
  padding: '8px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  width: '100%',
  marginBottom: '10px',
};

export default Header;
