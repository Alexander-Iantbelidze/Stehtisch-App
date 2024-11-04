import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC1o_auc4XDZJCd6seQcoYwa__33lpM1i0",
  authDomain: "stehtisch-app.firebaseapp.com",
  projectId: "stehtisch-app",
  storageBucket: "stehtisch-app.firebasestorage.app",
  messagingSenderId: "964408181792",
  appId: "1:964408181792:web:7ced2742b16fb57f6ba845",
  measurementId: "G-GYVKRC7XDZ"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
