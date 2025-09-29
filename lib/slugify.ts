export const normalizeSlug = (value: unknown) => {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = typeof value === "string" ? value : String(value);
  const trimmedValue = stringValue.trim();

  if (!trimmedValue) {
    return "";
  }

  return trimmedValue
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  };

export const slugify = (title: unknown) => normalizeSlug(title);