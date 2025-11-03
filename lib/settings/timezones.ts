export const DEFAULT_TIMEZONES = [
  "UTC",
  "America/New_York",
  "Europe/London",
  "Asia/Tokyo",
] as const

const unique = (values: readonly string[]): string[] => {
  const seen = new Set<string>()
  const result: string[] = []
  for (const value of values) {
    if (!seen.has(value)) {
      seen.add(value)
      result.push(value)
    }
  }
  return result
}

export function readRuntimeTimezones(): string[] {
  if (typeof Intl === "undefined") return []
  const supportedValuesOf = (Intl as typeof Intl & {
    supportedValuesOf?: (key: string) => string[]
  }).supportedValuesOf
  if (typeof supportedValuesOf !== "function") return []
  try {
    const values = supportedValuesOf("timeZone")
    if (!Array.isArray(values) || values.length === 0) return []
    return unique(values)
  } catch {
    return []
  }
}

export function areTimezonesEqual(
  a: readonly string[],
  b: readonly string[],
): boolean {
  if (a === b) return true
  if (a.length !== b.length) return false
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) return false
  }
  return true
}