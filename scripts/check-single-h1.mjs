import React from "react";
import { renderToString } from "react-dom/server";
import { load as loadHtml } from "cheerio";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import {
  PathnameContext,
  SearchParamsContext,
} from "next/dist/shared/lib/hooks-client-context.shared-runtime";

import { createRequire } from "module";

import { HeadingLevelRoot } from "../components/admin/heading-context";
import { AdminShellProvider } from "../components/admin/admin-shell-context";

const require = createRequire(import.meta.url);
const serverOnlyPath = require.resolve("server-only");
require.cache[serverOnlyPath] = {
  id: serverOnlyPath,
  filename: serverOnlyPath,
  loaded: true,
  exports: {},
};

if (!(globalThis).React) {
  globalThis.React = React;
}

process.env.ADMIN_BYPASS = process.env.ADMIN_BYPASS ?? "true";

globalThis.fetch = globalThis.fetch ?? (() =>
  Promise.resolve({ ok: true, json: async () => ({}) })
);

const routerStub = {
  push: () => {},
  replace: () => {},
  refresh: () => {},
  back: () => {},
  forward: () => {},
  prefetch: async () => {},
};

const ROUTES = [
  {
    name: "Blog Posts",
    pathname: "/admin/blogs",
    shellVariant: "dashboard",
    load: async () => {
      const mod = await import("../app/admin/blogs/page");
      return React.createElement(mod.default);
    },
  },
  {
    name: "Videos",
    pathname: "/admin/videos",
    shellVariant: "dashboard",
    load: async () => {
      const mod = await import("../app/admin/videos/page");
      return React.createElement(mod.default);
    },
  },
  {
    name: "Media",
    pathname: "/admin/media",
    shellVariant: "dashboard",
    load: async () => {
      const mod = await import("../app/admin/media/page");
      return React.createElement(mod.default);
    },
  },
  {
    name: "Categories",
    pathname: "/admin/categories",
    shellVariant: "dashboard",
    load: async () => {
      const mod = await import("../app/admin/categories/page");
      return React.createElement(mod.default);
    },
  },
  {
    name: "Comments & Reviews",
    pathname: "/admin/comments",
    shellVariant: "dashboard",
    load: async () => {
      const mod = await import("../app/admin/comments/page");
      return React.createElement(mod.default);
    },
  },
  {
    name: "Applications",
    pathname: "/admin/applications",
    shellVariant: "dashboard",
    load: async () => {
      const mod = await import("../app/admin/applications/page");
      return React.createElement(mod.default);
    },
  },
  {
    name: "Email Inbox",
    pathname: "/admin/email",
    shellVariant: "dashboard",
    load: async () => {
      const mod = await import("../app/admin/email/page");
      return React.createElement(mod.default);
    },
  },
  {
    name: "Email Inbox (Legacy)",
    pathname: "/admin/email-inbox",
    shellVariant: "dashboard",
    load: async () => {
      const mod = await import("../app/admin/email-inbox/page");
      return React.createElement(mod.default);
    },
  },
  {
    name: "Users",
    pathname: "/admin/users",
    shellVariant: "dashboard",
    load: async () => {
      const mod = await import("../app/admin/users/page");
      return React.createElement(mod.default);
    },
  },
  {
    name: "System Tools",
    pathname: "/admin/system-tools",
    shellVariant: null,
    load: async () => {
      const mod = await import("../app/(admin)/system-tools/page");
      return React.createElement(mod.default);
    },
  },
  {
    name: "Settings",
    pathname: "/admin/dashboard/settings",
    shellVariant: null,
    load: async () => {
      const [{ default: SettingsLayout }, { default: SettingsPage }] = await Promise.all([
        import("../app/admin/dashboard/(settings)/layout"),
        import("../app/admin/dashboard/(settings)/settings/page"),
      ]);
      const page = await SettingsPage({ searchParams: {} });
      return React.createElement(SettingsLayout, null, page);
    },
  },
];

function wrapWithProviders(element, route) {
  const withHeadings = React.createElement(HeadingLevelRoot, null, element);
  const wrapped = route.shellVariant
    ? React.createElement(AdminShellProvider, { variant: route.shellVariant }, withHeadings)
    : withHeadings;

  return React.createElement(
    AppRouterContext.Provider,
    { value: routerStub },
    React.createElement(
      PathnameContext.Provider,
      { value: route.pathname },
      React.createElement(
        SearchParamsContext.Provider,
        { value: new URLSearchParams() },
        wrapped,
      ),
    ),
  );
}

async function renderRoute(route) {
  const element = await route.load();
  const tree = wrapWithProviders(element, route);
  return renderToString(tree);
}

async function main() {
  let failed = false;

  for (const route of ROUTES) {
    try {
      const html = await renderRoute(route);
      const $ = loadHtml(html);
      const h1Count = $("h1").length;
      const ariaLevelOneCount = $("[role='heading'][aria-level='1']").length;

      if (h1Count !== 1 || ariaLevelOneCount > 0) {
        failed = true;
        console.error(
          `[check-single-h1] Route ${route.pathname} rendered <h1> count=${h1Count}, aria-level-1 count=${ariaLevelOneCount}`,
        );
        $("h1, [role='heading'][aria-level='1']").each((_idx, el) => {
          const snippet = $.html(el)?.replace(/\s+/g, " ") ?? "(unknown)";
          console.error(`  element: ${snippet}`);
        });
      } else {
        console.log(
          `[check-single-h1] ${route.pathname} rendered exactly one <h1>`
        );
      }
    } catch (error) {
      failed = true;
      console.error(`[check-single-h1] Failed to render ${route.pathname}`, error);
    }
  }

  if (failed) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("[check-single-h1] Unexpected error", error);
  process.exit(1);
});