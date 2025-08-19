"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function AdminBreadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean).slice(2)

  return (
    <nav aria-label="Breadcrumb" className="hidden md:block ml-4 max-w-full">
      <ol className="flex flex-wrap items-center text-sm text-muted-foreground">
        <li>
          <Link href="/admin/dashboard" className="hover:text-foreground">
            Home
          </Link>
        </li>
        {segments.map((seg, idx) => {
          const href = "/" + ["admin", "dashboard", ...segments.slice(0, idx + 1)].join("/")
          const isLast = idx === segments.length - 1
          return (
            <li key={idx} className="flex items-center">
              <span className="px-1">/</span>
              {isLast ? (
                <span aria-current="page" className="truncate max-w-[10ch]">
                  {decodeURIComponent(seg)}
                </span>
              ) : (
                <Link
                  href={href}
                  className="hover:text-foreground truncate max-w-[10ch]"
                >
                  {decodeURIComponent(seg)}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default AdminBreadcrumbs