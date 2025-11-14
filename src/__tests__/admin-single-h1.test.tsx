import "../../__tests__/helpers/mock-admin-dashboard";

import React from "react";
import { render, screen, act } from "@testing-library/react";

import { AdminRouteFactories } from "@/test-utils/adminRoutes";
import { SECTION_HEADINGS } from "@/app/admin/dashboard/section-metadata";

process.env.ADMIN_BYPASS = "true";

jest.mock("next/navigation", () => {
  const actual = jest.requireActual("next/navigation");
  return {
    ...actual,
    usePathname: jest.fn(() => "/"),
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
  };
});

jest.mock("@/app/(admin)/system-tools/RevalidateCard", () => ({
  __esModule: true,
  default: () => <div data-testid="mock-revalidate-card" />,
}));

jest.mock("@/app/(admin)/system-tools/StatusPanel", () => ({
  __esModule: true,
  default: () => <div data-testid="mock-status-panel" />,
}));

jest.mock("@/app/(admin)/system-tools/ScheduleDrawer", () => ({
  __esModule: true,
  default: () => <div data-testid="mock-schedule-drawer" />,
}));

jest.mock("@/app/admin/dashboard/(settings)/settings/actions", () => ({
  loadSettings: jest.fn(async () => ({
    profile: {
      displayName: "Admin User",
      email: "admin@example.com",
      bio: "",
      timezone: "UTC",
      avatarUrl: "",
      avatarStoragePath: undefined,
    },
    notifications: {
      email: { enabled: true },
      inApp: { enabled: true },
      events: { comments: true, applications: true, system: true },
    },
    appearance: {
      theme: "system",
      accent: "#3366ff",
      density: "comfortable",
      reducedMotion: false,
    },
  })),
}));

jest.mock("@/lib/admin-auth", () => ({
  getSessionEmailFromCookies: jest.fn(async () => "admin@example.com"),
  isAdmin: jest.fn(() => true),
}));

jest.mock("@/lib/settings/server", () => ({
  getCurrentAdminUid: jest.fn(async () => "uid-123"),
}));

jest.mock("@/lib/firebase-admin", () => ({
  getAdminAuth: jest.fn(() => ({
    getUser: jest.fn(async () => ({
      emailVerified: true,
      providerData: [{ providerId: "password" }],
    })),
  })),
}));

jest.mock("@/lib/log", () => ({
  logError: jest.fn(),
}));

jest.mock("@/types/next", () => ({
  unwrapPageProps: jest.fn(async (props: any) => props),
}));

jest.mock("@/components/admin/settings/ProfileForm", () => ({
  ProfileForm: () => <div data-testid="profile-form" />,
}));

jest.mock("@/components/admin/settings/NotificationsForm", () => ({
  NotificationsForm: () => <div data-testid="notifications-form" />,
}));

jest.mock("@/components/admin/settings/AppearanceForm", () => ({
  AppearanceForm: () => <div data-testid="appearance-form" />,
}));

const ROUTE_CASES: Array<[
  string,
  () => Promise<React.ReactElement>,
  string,
]> = [
  ["Blog Posts", AdminRouteFactories.Posts, SECTION_HEADINGS.blogs],
  ["Videos", AdminRouteFactories.Videos, SECTION_HEADINGS.videos],
  ["Media", AdminRouteFactories.Media, SECTION_HEADINGS.media],
  ["Categories", AdminRouteFactories.Categories, SECTION_HEADINGS.categories],
  [
    "Comments & Reviews",
    AdminRouteFactories["Comments & Reviews"],
    SECTION_HEADINGS.comments,
  ],
  ["Applications", AdminRouteFactories.Applications, SECTION_HEADINGS.applications],
  ["Email Inbox", AdminRouteFactories["Email Inbox"], SECTION_HEADINGS.inbox],
  [
    "Email Inbox (Legacy)",
    AdminRouteFactories["Email Inbox (Legacy)"],
    SECTION_HEADINGS.inbox,
  ],
  ["Users", AdminRouteFactories.Users, SECTION_HEADINGS.users],
  ["System Tools", AdminRouteFactories["System Tools"], SECTION_HEADINGS.system],
  ["Settings", AdminRouteFactories.Settings, SECTION_HEADINGS.settings],
];

describe("admin routes expose a single level-one heading", () => {
  beforeEach(() => {
    const mockResponse = {
      ok: true,
      json: async () => ({}),
    } as unknown as Response;

    globalThis.fetch = jest.fn(async () => mockResponse) as unknown as typeof fetch;
  });

  it.each(ROUTE_CASES)(
    "%s renders exactly one h1",
    async (_name, factory, expectedHeading) => {
      const element = await factory();
      await act(async () => {
        render(element);
      });

      const visible = screen.getAllByRole("heading", { level: 1 });
      const hidden = screen.queryAllByRole("heading", { level: 1, hidden: true });
      const unique = new Set([...visible, ...hidden]);

      expect(unique.size).toBe(1);
      expect(visible[0]).toHaveTextContent(expectedHeading);
    },
  );
});