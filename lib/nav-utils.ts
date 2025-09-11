export function isActive(pathname: string, href?: string): boolean {
  if (!href) return false
  if (href === "/" && pathname === "/") return true
  if (href !== "/" && pathname.startsWith(href)) return true
  return false
}