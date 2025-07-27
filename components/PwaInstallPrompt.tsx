'use client';

// Type for browsers where BeforeInstallPromptEvent is not in types
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

import { useEffect, useState } from "react";

export default function PwaInstallPrompt() {
  // Store the beforeinstallprompt event
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") return;

    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler as EventListener);

    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice; // Only await, don't assign to an unused variable
      setDeferredPrompt(null);
      setShow(false);
    }
  };

  // Allow user to dismiss prompt
  const handleClose = () => setShow(false);

  if (!show) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      background: "#000",
      color: "#fff",
      borderRadius: 12,
      padding: "1rem 2rem",
      zIndex: 9999,
      boxShadow: "0 6px 24px rgba(0,0,0,.25)",
      maxWidth: 340,
      display: "flex",
      alignItems: "center"
    }}>
      <span style={{ marginRight: 12 }}>Install Flavor Studios on your device!</span>
      <button
        onClick={handleInstall}
        aria-label="Install app"
        style={{
          background: "#fff",
          color: "#000",
          borderRadius: 8,
          padding: "0.5rem 1rem",
          fontWeight: "bold",
          border: "none",
          cursor: "pointer",
          marginRight: 8
        }}
      >
        Install
      </button>
      <button
        onClick={handleClose}
        aria-label="Close install prompt"
        style={{
          background: "transparent",
          color: "#fff",
          fontSize: "1.5rem",
          border: "none",
          cursor: "pointer",
          lineHeight: 1
        }}
      >
        ×
      </button>
    </div>
  );
}
