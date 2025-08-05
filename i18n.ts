export const fallbackLocale = "en" as const;

export const locales = [
  "en",
  "es",
  "hi",
  "fr",
  "ar",
  "zh",
  "ja",
  "de",
  "ru",
  "pt",
] as const;

export const defaultLocale = "en" as const;

export const localePrefix = "always" as const;

export default {
  locales,
  defaultLocale,
  localePrefix
};