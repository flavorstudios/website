"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Blog Posts", href: "/admin/dashboard/blog-posts" },
  { label: "Videos", href: "/admin/dashboard/videos" },
  { label: "Media", href: "/admin/dashboard/media" },
  { label: "Categories", href: "/admin/dashboard/categories" },
  { label: "Comments", href: "/admin/dashboard/comments" },
  { label: "Applications", href: "/admin/dashboard/applications" },
  { label: "Email Inbox", href: "/admin/dashboard/inbox" },
  { label: "Users", href: "/admin/dashboard/users" },
  { label: "Settings", href: "/admin/dashboard/settings" },
  { label: "System Tools", href: "/admin/dashboard/system" },
];

export function AdminTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin Sections"
      className="flex flex-wrap gap-2 rounded-xl border border-border bg-muted/40 p-2"
    >
      {tabs.map((tab) => {
        const isActive =
          pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background hover:text-foreground"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default AdminTabs;