// 🚨 LOCKED FILE: DO NOT MODIFY VIA VERCEL AI OR ANY AUTOMATED TOOL!
// This file contains critical admin/auth logic for Flavor Studios.
// To update, remove this notice and proceed manually.

import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your Firebase config (corrected bucket spelling)
const firebaseConfig = {
  apiKey: "AIzaSyC7HJwkNcLbpRY7QS6Lypqu81HmXkee8Bo",
  authDomain: "flavor-website.firebaseapp.com",
  projectId: "flavor-website",
  storageBucket: "flavor-website.appspot.com",
  messagingSenderId: "640233220533",
  appId: "1:640233220533:web:6b396845fe94aeb87b51fc",
  measurementId: "G-149FGEVH89"
};

// Avoid re-initializing on Fast Refresh
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
