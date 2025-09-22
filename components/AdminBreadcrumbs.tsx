import Link from "next/link";
import { cn } from "@/lib/utils";

export interface AdminBreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminBreadcrumbsProps {
  items: AdminBreadcrumbItem[];
  className?: string;
}

export default function AdminBreadcrumbs({ items, className }: AdminBreadcrumbsProps) {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm text-muted-foreground", className)}>
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const content = item.href && !isLast ? (
            <Link
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ) : (
            <span className={isLast ? "font-medium text-foreground" : undefined} aria-current={isLast ? "page" : undefined}>
              {item.label}
            </span>
          );

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {content}
              {!isLast && <span aria-hidden="true" className="text-muted-foreground/60">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}