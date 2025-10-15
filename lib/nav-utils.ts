function normalizePath(value: string): string {
  if (value === "/") {
    return "/";
  }

  // Strip any query string or hash fragment before we normalize the path.
  const queryIndex = value.indexOf("?");
  const hashIndex = value.indexOf("#");
  const cutIndex =
    queryIndex === -1
      ? hashIndex
      : hashIndex === -1
        ? queryIndex
        : Math.min(queryIndex, hashIndex);

  if (cutIndex !== -1) {
    value = value.slice(0, cutIndex);
  }

  if (!value.startsWith("/")) {
    value = `/${value}`;
  }

  return value.replace(/\/{2,}/g, "/").replace(/\/$/, "");
}

export function isActive(pathname: string, href?: string): boolean {
  if (!href) return false;

  const normalizedHref = normalizePath(href);
  const normalizedPath = normalizePath(pathname);

  if (normalizedHref === "/") {
    return normalizedPath === "/";
  }

  if (normalizedPath === normalizedHref) {
    return true;
  }

  return normalizedPath.startsWith(`${normalizedHref}/`);
}