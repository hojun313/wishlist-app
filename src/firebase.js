import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAsiv_F5YXjpvQoKBGokB9XrJlpAIm9ZU8",
  authDomain: "wish-board-7563c.firebaseapp.com",
  projectId: "wish-board-7563c",
  storageBucket: "wish-board-7563c.firebasestorage.app",
  messagingSenderId: "804679430350",
  appId: "1:804679430350:web:39317bf19f7c4e928f609f",
  measurementId: "G-S88CL5FQTL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
