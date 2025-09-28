import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // ⬅️ Add this

const firebaseConfig = {
  apiKey: "AIzaSyA4dP6k1obp9FDwFXnvyCo9Lo3AD79u54Q",
  authDomain: "login-1ebe7.firebaseapp.com",
  projectId: "login-1ebe7",
  storageBucket: "login-1ebe7.appspot.com", // ✅ FIXED from `firebasestorage.app` to `.appspot.com`
  messagingSenderId: "410503804820",
  appId: "1:410503804820:web:128bdd90bfc65f83090181",
  measurementId: "G-J5ELLP9WSF",
  databaseURL: "https://login-1ebe7-default-rtdb.firebaseio.com"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const storage = getStorage(app); // ✅ Add this line
