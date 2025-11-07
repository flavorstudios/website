"use client";

import { useEffect } from "react";

function setReadyAttribute(el: Element | null, ready: "0" | "1") {
  if (!el) return;
  el.setAttribute("data-ready", ready);
}

export function E2EReadyFlag() {
  useEffect(() => {
    const marker = document.querySelector("[data-testid=\"ui-ready\"]");
    if (!marker) {
      return;
    }

    const markReady = () => setReadyAttribute(marker, "1");

    try {
      const fonts = (document as Document & {
        fonts?: { ready?: Promise<unknown> };
      }).fonts;

      if (fonts?.ready) {
        fonts.ready.then(markReady).catch(markReady);
        return () => {
          setReadyAttribute(marker, "0");
        };
      }
    } catch {
      // Ignore font readiness errors.
    }

    markReady();

    return () => {
      setReadyAttribute(marker, "0");
    };
  }, []);

  return <span data-testid="ui-ready" data-ready="0" hidden aria-hidden="true" />;
}