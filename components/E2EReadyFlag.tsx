"use client";

import { useEffect, useRef } from "react";

function setReadyAttribute(el: Element | null, ready: "0" | "1") {
  if (!el) return;
  el.setAttribute("data-ready", ready);
}

export function E2EReadyFlag() {
  const markerRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return undefined;

    let cancelled = false;

    const markReady = () => {
      if (!cancelled) setReadyAttribute(marker, "1");
    };

    try {
      const fonts = (document as Document & {
        fonts?: { ready?: Promise<unknown> };
      }).fonts;

      if (fonts?.ready) {
        fonts.ready.then(markReady).catch(markReady);
        } else {
        requestAnimationFrame(markReady);
      }
    } catch {
      requestAnimationFrame(markReady);
    }

    return () => {
      cancelled = true;
      setReadyAttribute(marker, "0");
    };
  }, []);

  return (
    <span ref={markerRef} data-testid="ui-ready" data-ready="0" hidden aria-hidden="true" />
  );
}