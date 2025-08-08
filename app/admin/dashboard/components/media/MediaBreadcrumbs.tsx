"use client";
import { Fragment } from "react";

export interface Crumb {
  id: string;
  name: string;
}

export default function MediaBreadcrumbs({
  path,
  onNavigate,
}: {
  path: Crumb[];
  onNavigate: (id: string) => void;
}) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm mb-2">
      {path.map((c, i) => (
        <Fragment key={c.id}>
          {i > 0 && <span className="px-1">/</span>}
          <button
            type="button"
            className="underline"
            onClick={() => onNavigate(c.id)}
          >
            {c.name}
          </button>
        </Fragment>
      ))}
    </nav>
  );
}