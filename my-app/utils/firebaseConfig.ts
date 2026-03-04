import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: "portfolio-pulse-82779.firebaseapp.com",
  projectId: "portfolio-pulse-82779",
  storageBucket: "portfolio-pulse-82779.firebasestorage.app",
  messagingSenderId: "546631656366",
  appId: "1:546631656366:web:09dcd9f47ce82b5c289e3f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);