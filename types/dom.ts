import type { AriaAttributes, HTMLAttributes } from "react"

export type DataAttributes = {
  [K in `data-${string}`]?: unknown
}

export type WithDataAttributes<T> = T & DataAttributes

export type SafeHTMLAttributes<
  Element extends HTMLElement,
  Omitted extends keyof HTMLAttributes<Element> = never,
> = WithDataAttributes<Omit<HTMLAttributes<Element>, Omitted>> & AriaAttributes