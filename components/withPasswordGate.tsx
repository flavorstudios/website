"use client";
import { useState } from "react";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "flavor2025"; // Change this in .env!

export default function withPasswordGate(Component: React.ComponentType) {
  return function PasswordProtected(props: any) {
    const [input, setInput] = useState("");
    const [unlocked, setUnlocked] = useState(false);
    const [error, setError] = useState("");
    if (unlocked) return <Component {...props} />;
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <form
          className="bg-white border p-8 rounded-lg shadow-md flex flex-col gap-4"
          onSubmit={e => {
            e.preventDefault();
            if (input === ADMIN_PASSWORD) {
              setUnlocked(true);
            } else {
              setError("Wrong password!");
            }
          }}
        >
          <h2 className="text-xl font-bold mb-2">Admin Access</h2>
          <input
            type="password"
            placeholder="Enter admin password"
            value={input}
            className="border p-2 rounded"
            onChange={e => { setInput(e.target.value); setError(""); }}
          />
          {error && <div className="text-red-500">{error}</div>}
          <button
            type="submit"
            className="bg-primary text-white rounded px-4 py-2"
          >
            Unlock
          </button>
        </form>
      </div>
    );
  };
}
