"use client";

import { useEffect, useRef, useState } from "react";

type SkipLinkProps = {
  targetId?: string;
};

export function SkipLink({ targetId = "main-content" }: SkipLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab" || event.shiftKey) {
        return;
      }

      const activeElement = document.activeElement;
      const shouldFocusSkipLink =
        !activeElement ||
        activeElement === document.body ||
        activeElement === document.documentElement;

      if (shouldFocusSkipLink) {
        setIsVisible(true);
        const focusLink = () => linkRef.current?.focus();
        if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
          window.requestAnimationFrame(focusLink);
        } else {
          focusLink();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <a
      href={`#${targetId}`}
      className="skip-link"
      data-visible={isVisible ? "true" : undefined}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      onClick={(event) => {
        event.preventDefault()
        if (typeof document === "undefined") {
          return
        }
        const target = document.getElementById(targetId)
        if (!target) {
          return
        }
        const focusTarget = () => {
          if (typeof (target as HTMLElement).focus === "function") {
            target.focus({ preventScroll: true })
          }
        }
        if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
          window.requestAnimationFrame(focusTarget)
        } else {
          focusTarget()
        }
      }}
      ref={linkRef}
    >
      Skip to main content
    </a>
  );
}