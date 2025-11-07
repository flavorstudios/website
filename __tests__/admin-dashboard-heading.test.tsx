import { render, screen } from "@testing-library/react";
import React from "react";

import { SECTION_HEADINGS } from "@/app/admin/dashboard/section-metadata";

jest.mock("next/dynamic", () => () => () => null);

jest.mock("@/app/admin/dashboard/components/admin-sidebar", () => ({
  AdminSidebar: () => <nav data-testid="admin-sidebar" />,
}));

jest.mock("@/app/admin/dashboard/components/admin-header", () => ({
  AdminHeader: () => <header data-testid="admin-header" />,
}));

jest.mock("@/app/admin/dashboard/components/mobile-nav", () => ({
  __esModule: true,
  default: () => <div data-testid="mobile-nav" />,
}));

jest.mock("@/app/admin/dashboard/components/ErrorBoundary", () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@/app/admin/dashboard/contexts/role-context", () => ({
  RoleProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useRole: () => ({ hasPermission: () => true }),
}));

jest.mock("@/app/admin/dashboard/hooks/use-hotkeys", () => ({
  __esModule: true,
  default: () => undefined,
}));

jest.mock("@/components/ui/alert", () => ({
  Alert: ({ children, ...rest }: any) => <div {...rest}>{children}</div>,
  AlertDescription: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/ui/spinner", () => ({
  __esModule: true,
  default: () => <div data-testid="spinner" />,
}));

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: any) => <div>{children}</div>,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/lib/firebase", () => ({
  getFirebaseAuth: () => ({}),
  firebaseInitError: null,
}));

jest.mock("firebase/auth", () => ({
  signOut: jest.fn(() => Promise.resolve()),
}));

jest.mock("@/lib/http", () => ({
  fetchJson: jest.fn(() => Promise.resolve()),
}));

jest.mock("@/lib/log-client", () => ({
  logClientError: jest.fn(),
}));

jest.mock("@/app/admin/dashboard/components", () => ({
  DashboardOverview: () => null,
  BlogManager: () => null,
  VideoManager: () => null,
  CommentManager: () => null,
  SystemTools: () => null,
  UserManagement: () => null,
  CategoryManager: () => null,
  EmailInbox: () => null,
  MediaLibrary: () => null,
  CareerApplications: () => null,
  SystemSettings: () => null,
}));

describe("AdminDashboardPageClient heading structure", () => {
  beforeEach(() => {
    jest.resetModules();
    (global.fetch as unknown) = jest.fn(() =>
      Promise.resolve({ ok: true, json: async () => ({}) })
    );
  });

  it("renders exactly one h1 for the overview section", async () => {
    const { default: AdminDashboardPageClient } = await import(
      "@/app/admin/dashboard/AdminDashboardPageClient"
    );

    render(<AdminDashboardPageClient initialSection="overview" />);

    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(SECTION_HEADINGS.overview);
  });

  it("can defer the heading to the parent when suppressed", async () => {
    const { default: AdminDashboardPageClient } = await import(
      "@/app/admin/dashboard/AdminDashboardPageClient"
    );

    render(
      <>
        <h1 id="custom-heading">Dashboard Override</h1>
        <AdminDashboardPageClient
          initialSection="overview"
          suppressHeading
          headingId="custom-heading"
        />
      </>
    );

    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("Dashboard Override");
  });
});