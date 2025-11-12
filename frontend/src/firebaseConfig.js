// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBnv7_HJ0qyDb1p8qZWMuS3vaIzn2a0anU",
  authDomain: "myauthproject-79ccf.firebaseapp.com",
  projectId: "myauthproject-79ccf",
  storageBucket: "myauthproject-79ccf.firebasestorage.app",
  messagingSenderId: "594286175709",
  appId: "1:594286175709:web:b52812b90304814c5a4234",
  measurementId: "G-1DETDQCPFF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
