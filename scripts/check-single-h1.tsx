import React from "react";
import { renderToString } from "react-dom/server";
import { load } from "cheerio";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import {
  PathnameContext,
  SearchParamsContext,
} from "next/dist/shared/lib/hooks-client-context.shared-runtime";

if (!(globalThis as any).React) {
  (globalThis as any).React = React;
}

const routerStub = {
  push: () => {},
  replace: () => {},
  refresh: () => {},
  back: () => {},
  forward: () => {},
  prefetch: async () => {},
};

type PageModule = { default?: React.ComponentType<unknown> };

type RouteCase = {
  route: string;
  pathname: string;
  loader: () => Promise<PageModule>;
};

const ADMIN_ROUTES: RouteCase[] = [
  {
    route: "/admin/blogs",
    pathname: "/admin/blogs",
    loader: () => import("@/app/admin/blogs/page"),
  },
  {
    route: "/admin/videos",
    pathname: "/admin/videos",
    loader: () => import("@/app/admin/videos/page"),
  },
  {
    route: "/admin/media",
    pathname: "/admin/media",
    loader: () => import("@/app/admin/media/page"),
  },
  {
    route: "/admin/categories",
    pathname: "/admin/categories",
    loader: () => import("@/app/admin/categories/page"),
  },
  {
    route: "/admin/comments",
    pathname: "/admin/comments",
    loader: () => import("@/app/admin/comments/page"),
  },
  {
    route: "/admin/applications",
    pathname: "/admin/applications",
    loader: () => import("@/app/admin/applications/page"),
  },
  {
    route: "/admin/email",
    pathname: "/admin/email",
    loader: () => import("@/app/admin/email/page"),
  },
  {
    route: "/admin/email-inbox",
    pathname: "/admin/email-inbox",
    loader: () => import("@/app/admin/email-inbox/page"),
  },
  {
    route: "/admin/users",
    pathname: "/admin/users",
    loader: () => import("@/app/admin/users/page"),
  },
  {
    route: "/admin/system-tools",
    pathname: "/admin/system-tools",
    loader: () => import("@/app/(admin)/system-tools/page"),
  },
];

async function renderRoute({ loader, pathname }: RouteCase) {
  const mod = await loader();
  const Page = mod.default;
  if (!Page) {
    throw new Error(`Route loader for ${pathname} did not export a default component.`);
  }

  const tree = (
    <AppRouterContext.Provider value={routerStub as any}>
      <PathnameContext.Provider value={pathname}>
        <SearchParamsContext.Provider value={new URLSearchParams()}>
          <Page />
        </SearchParamsContext.Provider>
      </PathnameContext.Provider>
    </AppRouterContext.Provider>
  );

  return renderToString(tree);
}

async function main() {
  let failed = false;

  for (const route of ADMIN_ROUTES) {
    const html = await renderRoute(route);
    const $ = load(html);
    const h1Count = $("h1").length;
    const roleLevelOneCount = $('[role="heading"][aria-level="1"]').length;

    if (h1Count !== 1 || roleLevelOneCount > 0) {
      failed = true;
      console.error(
        `[check-single-h1] Expected exactly one <h1> and zero role="heading" aria-level="1" entries for ${route.route}. Found <h1>=${h1Count}, aria-level-1=${roleLevelOneCount}`,
      );
      $("h1, [role='heading'][aria-level='1']").each((_idx, el) => {
        const snippet = $.html(el)?.replace(/\s+/g, " ") ?? "(unknown heading)";
        console.error(`  element: ${snippet}`);
      });
    } else {
      console.log(
        `[check-single-h1] ${route.route} rendered exactly one <h1> (aria-level-1 roles: ${roleLevelOneCount})`,
      );
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