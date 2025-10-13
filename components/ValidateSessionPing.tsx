"use client";

import { useEffect } from "react";

export function ValidateSessionPing() {
  useEffect(() => {
    let cancelled = false;

    const ping = async () => {
      try {
        await fetch("/api/admin/validate-session", {
          credentials: "include",
          cache: "no-store",
        });
      } catch {
        // swallow network failures; preview page will render fallback text
      }
    };

    if (!cancelled) {
      void ping();
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}