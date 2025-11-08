import "./helpers/mock-admin-dashboard"

import React from "react"
import { render, screen, waitFor } from "@testing-library/react"

const replaceMock = jest.fn()
const pushMock = jest.fn()
const searchParams = new URLSearchParams()

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: pushMock }),
  usePathname: () => "/admin/dashboard/settings",
  useSearchParams: () => searchParams,
}))

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
}))

jest.mock("@/lib/admin-auth", () => ({
  getSessionEmailFromCookies: jest.fn(async () => "admin@example.com"),
  isAdmin: jest.fn(() => true),
}))

jest.mock("@/lib/settings/server", () => ({
  getCurrentAdminUid: jest.fn(async () => "uid-123"),
}))

jest.mock("@/lib/firebase-admin", () => ({
  getAdminAuth: jest.fn(() => ({
    getUser: jest.fn(async () => ({
      emailVerified: true,
      providerData: [{ providerId: "password" }],
    })),
  })),
}))

jest.mock("@/lib/log", () => ({
  logError: jest.fn(),
}))

jest.mock("@/types/next", () => ({
  unwrapPageProps: jest.fn(async (props: any) => props),
}))

jest.mock("@/components/admin/settings/ProfileForm", () => ({
  ProfileForm: () => <div data-testid="profile-form" />,
}))

jest.mock("@/components/admin/settings/NotificationsForm", () => ({
  NotificationsForm: () => <div data-testid="notifications-form" />,
}))

jest.mock("@/components/admin/settings/AppearanceForm", () => ({
  AppearanceForm: () => <div data-testid="appearance-form" />,
}))

describe("admin layout variants", () => {
  afterEach(() => {
    replaceMock.mockClear()
    pushMock.mockClear()
    searchParams.delete("tab")
  })

  it("renders dashboard routes with the sidebar and variant metadata", async () => {
    const { default: DashboardLayout } = await import("@/app/admin/dashboard/(dashboard)/layout")
    const { default: SystemPage } = await import("@/app/admin/dashboard/(dashboard)/system/page")

    render(
      <DashboardLayout>
        <SystemPage />
      </DashboardLayout>
    )

    expect(await screen.findByTestId("admin-sidebar")).toBeInTheDocument()
    expect(document.querySelector('[data-admin-shell-variant="dashboard"]')).not.toBeNull()
  })

  it("renders settings without the sidebar and keeps tabs interactive", async () => {
    const { default: SettingsLayout } = await import("@/app/admin/dashboard/(settings)/layout")
    const { default: SettingsPage } = await import("@/app/admin/dashboard/(settings)/settings/page")

    const page = await SettingsPage({ searchParams: { tab: "profile" } } as any)

    render(<SettingsLayout>{page}</SettingsLayout>)

    expect(screen.queryByTestId("admin-sidebar")).toBeNull()
    await waitFor(() => {
      expect(document.querySelector('[data-admin-shell-variant="settings"]')).not.toBeNull()
    })
    const tabs = screen.getAllByRole("tab")
    expect(tabs).toHaveLength(3)
    await waitFor(() => expect(replaceMock).toHaveBeenCalled())
  })
})