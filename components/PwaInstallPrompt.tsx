'use client';

import { useEffect, useState } from "react";

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      // You can track outcome here if needed
      setDeferredPrompt(null);
      setShow(false);
    }
  };

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
      boxShadow: "0 6px 24px rgba(0,0,0,.25)"
    }}>
      <span style={{ marginRight: 12 }}>Install Flavor Studios on your device!</span>
      <button onClick={handleInstall} style={{
        background: "#fff",
        color: "#000",
        borderRadius: 8,
        padding: "0.5rem 1rem",
        fontWeight: "bold",
        border: "none",
        cursor: "pointer"
      }}>
        Install
      </button>
    </div>
  );
}
