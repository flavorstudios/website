import React from "react";
import type { ReactElement, ReactNode } from "react";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import {
  PathnameContext,
  SearchParamsContext,
} from "next/dist/shared/lib/hooks-client-context.shared-runtime";

import AdminBlogsPage from "@/app/admin/blogs/page";
import AdminVideosPage from "@/app/admin/videos/page";
import AdminMediaPage from "@/app/admin/media/page";
import AdminCategoriesPage from "@/app/admin/categories/page";
import AdminCommentsPage from "@/app/admin/comments/page";
import AdminApplicationsPage from "@/app/admin/applications/page";
import AdminEmailPage from "@/app/admin/email/page";
import AdminEmailInboxPage from "@/app/admin/email-inbox/page";
import AdminUsersPage from "@/app/admin/users/page";
import SystemToolsPage from "@/app/(admin)/system-tools/page";
import { AdminShellProvider } from "@/components/admin/admin-shell-context";
import { HeadingLevelRoot } from "@/components/admin/heading-context";

const routerStub = {
  push: () => {},
  replace: () => {},
  refresh: () => {},
  back: () => {},
  forward: () => {},
  prefetch: async () => {},
};

function withRouter(children: ReactNode, pathname: string): ReactElement {
  return (
    <AppRouterContext.Provider value={routerStub as any}>
      <PathnameContext.Provider value={pathname}>
        <SearchParamsContext.Provider value={new URLSearchParams()}>
          {children}
        </SearchParamsContext.Provider>
      </PathnameContext.Provider>
    </AppRouterContext.Provider>
  );
}

function createDashboardFactory(
  Component: React.ComponentType,
  pathname: string,
): () => Promise<ReactElement> {
  return async () =>
    withRouter(
      <AdminShellProvider variant="dashboard">
        <HeadingLevelRoot>
          <Component />
        </HeadingLevelRoot>
      </AdminShellProvider>,
      pathname,
    );
}

const systemToolsFactory = async () =>
  withRouter(
    <HeadingLevelRoot>
      <SystemToolsPage />
    </HeadingLevelRoot>,
    "/admin/system-tools",
  );

const settingsFactory = async () => {
  const [{ default: SettingsLayout }, { default: SettingsPage }] = await Promise.all([
    import("@/app/admin/dashboard/(settings)/layout"),
    import("@/app/admin/dashboard/(settings)/settings/page"),
  ]);
  const page = await SettingsPage({ searchParams: {} } as any);

  return withRouter(
    <SettingsLayout>
      <HeadingLevelRoot>{page}</HeadingLevelRoot>
    </SettingsLayout>,
    "/admin/dashboard/settings",
  );
};

export const AdminRouteFactories = {
  Posts: createDashboardFactory(AdminBlogsPage, "/admin/blogs"),
  Videos: createDashboardFactory(AdminVideosPage, "/admin/videos"),
  Media: createDashboardFactory(AdminMediaPage, "/admin/media"),
  Categories: createDashboardFactory(AdminCategoriesPage, "/admin/categories"),
  "Comments & Reviews": createDashboardFactory(AdminCommentsPage, "/admin/comments"),
  Applications: createDashboardFactory(AdminApplicationsPage, "/admin/applications"),
  "Email Inbox": createDashboardFactory(AdminEmailPage, "/admin/email"),
  "Email Inbox (Legacy)": createDashboardFactory(AdminEmailInboxPage, "/admin/email-inbox"),
  Users: createDashboardFactory(AdminUsersPage, "/admin/users"),
  "System Tools": systemToolsFactory,
  Settings: settingsFactory,
};

export type AdminRouteName = keyof typeof AdminRouteFactories;
export type AdminRouteFactory = () => Promise<ReactElement>;