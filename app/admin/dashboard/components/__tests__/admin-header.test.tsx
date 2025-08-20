import { render, screen } from "@testing-library/react"
import { AdminHeader } from "../admin-header"

jest.mock("next/navigation", () => ({
  usePathname: () => "/admin/dashboard",
  useRouter: () => ({ push: jest.fn(), prefetch: jest.fn() }),
}))

// Make next/dynamic return a no-op component for tests
jest.mock("next/dynamic", () => () => () => null)

describe("AdminHeader", () => {
  beforeEach(() => {
    // stub fetch used for avatar + notifications loading
    global.fetch = jest.fn((url: RequestInfo) => {
      const s = typeof url === "string" ? url : ""
      if (s.includes("notifications")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ notifications: [] }),
        }) as unknown as Response
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ settings: { profile: { avatar: "" } } }),
      }) as unknown as Response
    }) as unknown as typeof fetch
  })

  it("renders the centered search and no deprecated actions", () => {
    render(
      <AdminHeader
        onLogout={() => {}}
        sidebarOpen={false}
        setSidebarOpen={() => {}}
      />
    )

    // search present
    expect(
      screen.getByPlaceholderText("Search titles, descriptions, tags…")
    ).toBeInTheDocument()

    // legacy actions gone
    expect(screen.queryByText(/View Site/i)).toBeNull()
    expect(screen.queryByText(/Save/i)).toBeNull()
    expect(screen.queryByText(/New/i)).toBeNull()
  })
})
