"use client";
import React, { useEffect, useState } from "react";

const InstallIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
  </svg>
);

export function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShow(false);
    }
  };

  if (!show) return null;

  return (
    <button
      onClick={handleClick}
      className="flex flex-row items-center gap-2 px-4 py-2 rounded bg-yellow-400 hover:bg-yellow-300 text-black font-semibold transition shadow-sm"
      title="Install the Flavor Studios App"
      style={{ minWidth: "120px" }} // Ensures enough space for text
    >
      <InstallIcon />
      <span className="block">Install App</span>
    </button>
  );
}