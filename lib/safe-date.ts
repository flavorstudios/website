const DEFAULT_LOCALE: Intl.LocalesArgument = "en-US";
const DEFAULT_TIMEZONE = "UTC";

export function safeDateLabel(
  value: unknown,
  options?: Intl.DateTimeFormatOptions,
  locale: Intl.LocalesArgument = DEFAULT_LOCALE,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return null;
  }

  const parsedDate = new Date(trimmedValue);
  if (Number.isNaN(parsedDate.getTime())) {
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