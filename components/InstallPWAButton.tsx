"use client";
import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [showButton, setShowButton] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Only show if not dismissed
    if (typeof window !== "undefined" && sessionStorage.getItem("fs-hide-pwa") === "1") {
      setHidden(true);
      return;
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt && "prompt" in deferredPrompt) {
      // @ts-ignore
      (deferredPrompt as any).prompt();
      // @ts-ignore
      const choiceResult = await (deferredPrompt as any).userChoice;
      if (choiceResult.outcome === "accepted") {
        setShowButton(false);
      }
    }
  };

  const handleClose = () => {
    setShowButton(false);
    setHidden(true);
    if (typeof window !== "undefined") sessionStorage.setItem("fs-hide-pwa", "1");
  };

  // ** Show only on desktop or mobile? **
  // Uncomment the following to show only on desktop
  // useEffect(() => {
  //   if (typeof window !== "undefined" && window.innerWidth < 768) {
  //     setShowButton(false);
  //   }
  // }, []);

  if (!showButton || hidden) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 animate-fade-in"
      style={{
        animation: "fadein 0.7s",
      }}
    >
      <div className="flex items-center bg-gradient-to-r from-pink-500 via-indigo-600 to-purple-600 shadow-2xl border border-white/10 rounded-2xl px-6 py-3 gap-3 text-white font-bold backdrop-blur-xl"
        style={{
          boxShadow: "0 8px 24px 0 rgba(120,40,200,0.2), 0 1.5px 3px 0 rgba(0,0,0,0.08)",
        }}
      >
        <Download className="w-6 h-6 mr-2 animate-bounce" />
        <span className="mr-3">Install Flavor Studios App</span>
        <button
          onClick={handleInstall}
          className="px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 transition"
          style={{ fontWeight: 600 }}
        >
          Install
        </button>
        <button
          onClick={handleClose}
          className="ml-2 text-white/80 hover:text-white"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <style jsx global>{`
        @keyframes fadein {
          from { opacity: 0; transform: translateY(30px);}
          to { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </div>
  );
}