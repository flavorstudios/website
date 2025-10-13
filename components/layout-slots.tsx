"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

export type LayoutSlotsValue = {
  header?: ReactNode;
  footer?: ReactNode;
  afterMain?: ReactNode;
};

type LayoutSlotsContextValue = {
  slots: LayoutSlotsValue;
  setSlots: (
    updater: Partial<LayoutSlotsValue> | ((prev: LayoutSlotsValue) => Partial<LayoutSlotsValue>),
  ) => void;
};

const LayoutSlotsContext = createContext<LayoutSlotsContextValue | null>(null);

export type LayoutSlotsProviderProps = LayoutSlotsValue & {
  children: ReactNode;
};

export function LayoutSlotsRoot({ header, footer, afterMain, children }: LayoutSlotsProviderProps) {
  const [slots, setSlotsState] = useState<LayoutSlotsValue>({ header, footer, afterMain });

  useEffect(() => {
    setSlotsState((prev) => ({
      header: typeof header !== "undefined" ? header : prev.header,
      footer: typeof footer !== "undefined" ? footer : prev.footer,
      afterMain: typeof afterMain !== "undefined" ? afterMain : prev.afterMain,
    }));
  }, [header, footer, afterMain]);

  const setSlots = useCallback<LayoutSlotsContextValue["setSlots"]>((updater) => {
    setSlotsState((prev) => ({
      ...prev,
      ...(typeof updater === "function" ? updater(prev) : updater),
    }));
  }, []);

  const value = useMemo<LayoutSlotsContextValue>(
    () => ({
      slots,
      setSlots,
    }),
    [slots, setSlots],
  );

  return <LayoutSlotsContext.Provider value={value}>{children}</LayoutSlotsContext.Provider>;
}

export function LayoutSlots({ header, footer, afterMain, children }: LayoutSlotsProviderProps) {
  const ctx = useContext(LayoutSlotsContext);
  const previousRef = useRef<Partial<LayoutSlotsValue>>({});

  useEffect(() => {
    if (!ctx) return;

    const updates: Partial<LayoutSlotsValue> = {};
    const previous: Partial<LayoutSlotsValue> = {};

    if (typeof header !== "undefined") {
      previous.header = ctx.slots.header;
      updates.header = header;
    }
    if (typeof footer !== "undefined") {
      previous.footer = ctx.slots.footer;
      updates.footer = footer;
    }
    if (typeof afterMain !== "undefined") {
      previous.afterMain = ctx.slots.afterMain;
      updates.afterMain = afterMain;
    }

    const hasUpdates = Object.keys(updates).length > 0;

    if (hasUpdates) {
      previousRef.current = previous;
      ctx.setSlots((prev) => ({ ...prev, ...updates }));
    } else {
      previousRef.current = {};
    }

    return () => {
      if (!hasUpdates) return;

      const restore = previousRef.current;
      ctx.setSlots((prev) => ({
        ...prev,
        ...restore,
      }));
    };
  }, [afterMain, ctx, footer, header]);

  return <>{children}</>;
}

export function HeaderSlot({ fallback }: { fallback?: ReactNode }) {
  const ctx = useContext(LayoutSlotsContext);
  const header = ctx?.slots.header;
  return <>{header ?? fallback ?? null}</>;
}

export function FooterSlot({ fallback }: { fallback?: ReactNode }) {
  const ctx = useContext(LayoutSlotsContext);
  const footer = ctx?.slots.footer;
  return <>{footer ?? fallback ?? null}</>;
}

export function AfterMainSlot() {
  const ctx = useContext(LayoutSlotsContext);
  const afterMain = ctx?.slots.afterMain;
  return <>{afterMain ?? null}</>;
}