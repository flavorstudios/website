/* eslint-disable @typescript-eslint/no-unused-vars */

import type { SafeHTMLAttributes } from "@/types/dom"

// Should accept aria- and data- attributes
const headingOk: SafeHTMLAttributes<HTMLHeadingElement, "id" | "className"> = {
  role: "heading",
  tabIndex: -1,
  "aria-live": "polite",
  "data-testid": "heading",
}

const headingBad: SafeHTMLAttributes<HTMLHeadingElement, "id" | "className"> = {
  // @ts-expect-error Unknown attribute should not be allowed
  unknownThing: 123,
}

export {}