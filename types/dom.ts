import type * as React from "react"

export type DataAttributes = {
  [K in `data-${string}`]?: unknown
}

export type WithDataAttributes<T> = T & DataAttributes

export type SafeHTMLAttributes<
  Element extends HTMLElement,
  Omitted extends keyof React.HTMLAttributes<Element> = never,
> = WithDataAttributes<Omit<React.HTMLAttributes<Element>, Omitted>> &
  React.AriaAttributes