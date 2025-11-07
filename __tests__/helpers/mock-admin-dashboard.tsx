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