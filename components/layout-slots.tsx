"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";

export type LayoutSlotsValue = {
  header?: ReactNode;
  footer?: ReactNode;
  afterMain?: ReactNode;
};

const LayoutSlotsContext = createContext<LayoutSlotsValue | null>(null);

export type LayoutSlotsProviderProps = LayoutSlotsValue & {
  children: ReactNode;
};

export function LayoutSlotsRoot({ header, footer, afterMain, children }: LayoutSlotsProviderProps) {
  return (
    <LayoutSlotsContext.Provider value={{ header, footer, afterMain }}>
      {children}
    </LayoutSlotsContext.Provider>
  );
}

export function LayoutSlots({ header, footer, afterMain, children }: LayoutSlotsProviderProps) {
  const parent = useContext(LayoutSlotsContext);
  const value: LayoutSlotsValue = {
    header: header ?? parent?.header,
    footer: footer ?? parent?.footer,
    afterMain: afterMain ?? parent?.afterMain,
  };

  return <LayoutSlotsContext.Provider value={value}>{children}</LayoutSlotsContext.Provider>;
}

export function HeaderSlot({ fallback }: { fallback?: ReactNode }) {
  const ctx = useContext(LayoutSlotsContext);
  return <>{ctx?.header ?? fallback ?? null}</>;
}

export function FooterSlot({ fallback }: { fallback?: ReactNode }) {
  const ctx = useContext(LayoutSlotsContext);
  return <>{ctx?.footer ?? fallback ?? null}</>;
}

export function AfterMainSlot() {
  const ctx = useContext(LayoutSlotsContext);
  return <>{ctx?.afterMain ?? null}</>;
}