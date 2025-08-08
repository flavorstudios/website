"use client";
import { useEffect, useRef } from "react";

export function useArrowNavigation<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleKey = (e: KeyboardEvent) => {
      const focusables = Array.from(
        el.querySelectorAll<HTMLElement>("[tabindex='0']")
      );
      const index = focusables.indexOf(document.activeElement as HTMLElement);
      if (index === -1) return;
      let next = index;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        next = Math.min(focusables.length - 1, index + 1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        next = Math.max(0, index - 1);
      } else {
        return;
      }
      e.preventDefault();
      focusables[next]?.focus();
    };

    el.addEventListener("keydown", handleKey);
    return () => el.removeEventListener("keydown", handleKey);
  }, []);

  return ref;
}
