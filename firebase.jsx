import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";  // Correct import for Firestore
import { getStorage } from "firebase/storage";  // Correct import for Firebase Storage
import { getAuth } from "firebase/auth";  // Correct import for Firebase Authentication

const firebaseConfig = {
  apiKey: "AIzaSyCWSBMpZ2SoImKQeoH-j7u63dvVA1GKVuw",
  authDomain: "perdaycoaching.firebaseapp.com",
  projectId: "perdaycoaching",
  storageBucket: "perdaycoaching.appspot.com",
  messagingSenderId: "303500461503",
  appId: "1:303500461503:web:5765538420997fc6880d0a",
  measurementId: "G-QY7SK61FYM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore and Storage
const db = getFirestore(app);
const storage = getStorage(app);

// Authentication
const auth = getAuth(app);  // Correct initialization of Firebase Authentication

export { db, storage, auth };
