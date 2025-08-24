"use client";

import { useHotkeys as useHotkeysLib } from "react-hotkeys-hook";
import type { Options } from "react-hotkeys-hook";
import type { DependencyList } from "react";

function isInputLike(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return (
    el.isContentEditable ||
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT"
  );
}

export type { Options };
export type HotkeyCallback = (event: KeyboardEvent, handler: unknown) => void;

export default function useHotkeys(
  keys: string | readonly string[],
  callback: HotkeyCallback,
  options?: Options,
  deps?: DependencyList
) {
  useHotkeysLib(
    keys as string | string[],
    (event, handler) => {
      if (isInputLike(event?.target || null)) return;
      callback(event, handler);
    },
    options,
    deps
  );
}
