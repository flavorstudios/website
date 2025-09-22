import { safeDateLabel } from "./safe-date";

type DateInput = string | number | Date | null | undefined;

function normalizeDateInput(date: DateInput): string | null {
  if (typeof date === "string") {
    return date;
  }

  if (typeof date === "number" && Number.isFinite(date)) {
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  if (date instanceof Date) {
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  return null;
}

export function formatDate(
  date: DateInput,
  options?: Intl.DateTimeFormatOptions | boolean,
): string {
  const normalized = normalizeDateInput(date);
  if (!normalized) {
    return "—";
  }

  const formatOptions: Intl.DateTimeFormatOptions | undefined =
    typeof options === "boolean"
      ? options
        ? { dateStyle: "medium", timeStyle: "short" }
        : undefined
      : options;

  const label = safeDateLabel(normalized, formatOptions);

  return label ?? "—";
}