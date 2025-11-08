import React from "react";

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

jest.mock("@/app/admin/dashboard/components", () => {
  const React = require("react");
  const { PageHeader } = require("@/components/admin/page-header");

  const createSection = (title: string) => {
    const Component = () =>
      React.createElement(
        "div",
        { "data-testid": `mock-section-${title.toLowerCase().replace(/[^a-z]+/g, "-")}` },
        React.createElement(PageHeader, {
          title,
          description: "Mock admin section",
        })
      );
    Component.displayName = `Mock${title.replace(/\s+/g, "")}`;
    return Component;
  };

  return {
    DashboardOverview: createSection("Overview"),
    BlogManager: createSection("Blog Manager"),
    VideoManager: createSection("Video Manager"),
    CommentManager: createSection("Comments"),
    SystemTools: createSection("System Tools"),
    UserManagement: createSection("User Management"),
    CategoryManager: createSection("Categories"),
    EmailInbox: createSection("Email Inbox"),
    MediaLibrary: createSection("Media Library"),
    CareerApplications: createSection("Applications"),
  };
});