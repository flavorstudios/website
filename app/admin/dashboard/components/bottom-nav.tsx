"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Image as ImageIcon, Users, Settings } from "lucide-react";

const items = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/dashboard/media", label: "Media", icon: ImageIcon },
  {
    href: "/admin/dashboard/users",
    label: "User management",
    ariaLabel: "Users",
    icon: Users,
  },
  { href: "/admin/dashboard/settings", label: "Settings", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 border-t bg-background shadow md:hidden z-40">
      <ul className="flex justify-around">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center h-14 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${active ? "text-primary" : "text-muted-foreground"}`}
                aria-label={item.ariaLabel ?? item.label}
              >
                <Icon className="h-5 w-5 mb-1" aria-hidden="true" />
                <span className="sr-only sm:not-sr-only">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}