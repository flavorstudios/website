// 🚨 LOCKED FILE: DO NOT MODIFY VIA VERCEL AI OR ANY AUTOMATED TOOL!
// This file contains critical admin/auth logic for Flavor Studios.
// To update, remove this notice and proceed manually.

"use client";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { useEffect, useState } from "react";

export default function GoogleLoginButton({ onAuth }: { onAuth: (user: any) => void }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (u) onAuth(u);
    });
    return () => unsub();
  }, [onAuth]);

  if (user)
    return (
      <div className="flex items-center gap-3">
        <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full" />
        <span>{user.displayName}</span>
        <button
          className="bg-red-500 text-white rounded px-2 py-1 text-xs ml-2"
          onClick={() => signOut(auth)}
        >
          Logout
        </button>
      </div>
    );

  return (
    <button
      className="bg-primary text-white rounded px-4 py-2"
      onClick={() => signInWithPopup(auth, googleProvider)}
    >
      Login with Google
    </button>
  );
}