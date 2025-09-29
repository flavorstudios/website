export function extractAuthorValue(value: unknown): string | null {
  if (!value) return null;

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }

  if (Array.isArray(value)) {
    const parts = value
      .map((item) => extractAuthorValue(item))
      .filter((item): item is string => typeof item === "string" && item.length > 0);

    return parts.length > 0 ? parts.join(", ") : null;
  }

  if (typeof value === "object") {
    const candidate = (value as { name?: unknown }).name;
    return extractAuthorValue(candidate);
  }

  return null;
}

export function normalizeAuthor(author: unknown): string {
  return extractAuthorValue(author) ?? "Flavor Studios";
}