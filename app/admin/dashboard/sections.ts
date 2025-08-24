export const ADMIN_SECTIONS = [
  "overview",
  "blogs",
  "videos",
  "media",
  "categories",
  "comments",
  "applications",
  "inbox",
  "users",
  "settings",
  "system",
] as const;

export type SectionId = typeof ADMIN_SECTIONS[number];