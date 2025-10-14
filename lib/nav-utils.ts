function normalizePath(value: string): string {
  if (value === "/") {
    return "/";
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