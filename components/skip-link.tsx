"use client";

import { useEffect, useRef, useState } from "react";

export function SkipLink() {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.key === "Tab" &&
        !event.shiftKey &&
        document.activeElement === document.body
      ) {
        linkRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <a
      href="#main-content"
      className="skip-link"
      data-visible={isVisible ? "true" : undefined}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      ref={linkRef}
    >
      Skip to main content
    </a>
  );
}