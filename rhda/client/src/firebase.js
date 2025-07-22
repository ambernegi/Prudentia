// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBHVGUQAotJI1qMhZnSo8qgMzBfuNBdAOk",
  authDomain: "booking-platform-dd00c.firebaseapp.com",
  projectId: "booking-platform-dd00c",
  storageBucket: "booking-platform-dd00c.appspot.com",
  messagingSenderId: "873221376676",
  appId: "1:873221376676:web:1609be0d927ea0011db431",
  measurementId: "G-574QF0W1XG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db }; 