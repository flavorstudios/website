const DEFAULT_LOCALE: Intl.LocalesArgument = "en-US";
const DEFAULT_TIMEZONE = "UTC";

function toDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return null;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return null;
    }

    const parsed = new Date(trimmedValue);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

export function safeDateLabel(
  value: unknown,
  options?: Intl.DateTimeFormatOptions,
  locale: Intl.LocalesArgument = DEFAULT_LOCALE,
): string | null {
  const parsedDate = toDate(value);

  if (!parsedDate) {
    return null;
  }

  try {
    const formatter = new Intl.DateTimeFormat(locale, {
      timeZone: DEFAULT_TIMEZONE,
      ...options,
    });
    return formatter.format(parsedDate);
  } catch {
    return null;
  }
}