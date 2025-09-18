"use client";

import { useState, type CSSProperties } from "react";

const hiddenStyles: CSSProperties = {
  width: "1px",
  height: "1px",
  clip: "rect(0 0 0 0)",
  clipPath: "inset(100%)",
  overflow: "hidden",
  whiteSpace: "nowrap",
  padding: 0,
  border: 0,
};

export function SkipLink() {
  const [isHidden, setIsHidden] = useState(true);

  return (
    <a
      href="#main-content"
      className="skip-link"
      style={isHidden ? hiddenStyles : undefined}
      onFocus={() => setIsHidden(false)}
      onBlur={() => setIsHidden(true)}
    >
      Skip to main content
    </a>
  );
}