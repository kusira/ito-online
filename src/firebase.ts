import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "ito-online-6e0bf.firebaseapp.com",
  projectId: "ito-online-6e0bf",
  storageBucket: "ito-online-6e0bf.appspot.com",
  messagingSenderId: "149202348541",
  appId: "1:149202348541:web:d17196df2d25bb3714d194"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {app, db}