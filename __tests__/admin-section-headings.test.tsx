import "./helpers/mock-admin-dashboard";

import React from "react";
import { render, screen } from "@testing-library/react";

import { SECTION_HEADINGS } from "@/app/admin/dashboard/section-metadata";
import type { SectionId } from "@/app/admin/dashboard/sections";

type PageModule = { default: React.ComponentType<unknown> };

type RouteCase = {
  route: string;
  section: SectionId;
  loader: () => Promise<PageModule>;
};

const ADMIN_ROUTE_CASES: RouteCase[] = [
  {
    route: "/admin/blogs",
    section: "blogs",
    loader: () => import("@/app/admin/blogs/page"),
  },
  {
    route: "/admin/videos",
    section: "videos",
    loader: () => import("@/app/admin/videos/page"),
  },
  {
    route: "/admin/media",
    section: "media",
    loader: () => import("@/app/admin/media/page"),
  },
  {
    route: "/admin/categories",
    section: "categories",
    loader: () => import("@/app/admin/categories/page"),
  },
  {
    route: "/admin/comments",
    section: "comments",
    loader: () => import("@/app/admin/comments/page"),
  },
  {
    route: "/admin/applications",
    section: "applications",
    loader: () => import("@/app/admin/applications/page"),
  },
  {
    route: "/admin/email",
    section: "inbox",
    loader: () => import("@/app/admin/email/page"),
  },
  {
    route: "/admin/users",
    section: "users",
    loader: () => import("@/app/admin/users/page"),
  },
  {
    route: "/admin/dashboard/system",
    section: "system",
    loader: () => import("@/app/admin/dashboard/system/page"),
  },
];

describe("admin route headings", () => {
  beforeEach(() => {
    (global.fetch as unknown) = jest.fn(() =>
      Promise.resolve({ ok: true, json: async () => ({}) })
    );
  });

  it.each(ADMIN_ROUTE_CASES)(
    "renders exactly one h1 on %s",
    async ({ loader, section }) => {
      const { default: Page } = await loader();
      render(<Page />);

      const headings = screen.getAllByRole("heading", { level: 1 });
      expect(headings).toHaveLength(1);
      expect(headings[0]).toHaveTextContent(SECTION_HEADINGS[section]);
    }
  );
});