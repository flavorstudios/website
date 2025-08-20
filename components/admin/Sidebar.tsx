"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const items = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Blog Posts', href: '/admin/posts' },
  { label: 'Videos', href: '/admin/videos' },
  { label: 'Media', href: '/admin/media' },
  { label: 'Categories', href: '/admin/categories' },
  { label: 'Comments', href: '/admin/comments' },
  { label: 'Applications', href: '/admin/applications' },
  { label: 'Email Inbox', href: '/admin/email-inbox' },
  { label: 'Users', href: '/admin/users' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin">
      <ul className="space-y-1">
        {items.map((i) => (
          <li key={i.href}>
            <Link
              href={i.href}
              className={clsx(
                'flex items-center rounded-lg px-3 py-2 hover:bg-muted',
                pathname.startsWith(i.href) && 'bg-primary text-primary-foreground'
              )}
            >
              <span className="ml-2">{i.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default AdminSidebar;