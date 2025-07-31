export function formatDate(date: string | number | Date, options?: Intl.DateTimeFormatOptions) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { timeZone: 'UTC', ...options });
}
