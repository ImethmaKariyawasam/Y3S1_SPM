// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB9kiW5zPbcRYauOqFviqupmfz0jlC3jWk",
  authDomain: "visionspot-15235.firebaseapp.com",
  projectId: "visionspot-15235",
  storageBucket: "visionspot-15235.appspot.com",
  messagingSenderId: "976249217754",
  appId: "1:976249217754:web:7f076b6c9e74b133237be3"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
