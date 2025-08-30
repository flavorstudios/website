import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { UserMenu } from "../header/user-menu"

const push = jest.fn()

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}))

describe("UserMenu", () => {
  it("shows essential menu options", async () => {
    const user = userEvent.setup()

    render(
      <UserMenu avatar="" name="Admin" userRole="Owner" onLogout={() => {}} />,
    )

    await user.click(screen.getByRole("button", { name: /user menu/i }))

    expect(screen.getByText("Profile Settings")).toBeInTheDocument()
    expect(screen.getByText("User Roles")).toBeInTheDocument()
    expect(screen.getByText("Activity Log")).toBeInTheDocument()
    expect(screen.getByText("Switch Account")).toBeInTheDocument()
    expect(screen.getByText("Sign out")).toBeInTheDocument()
  })

  it("navigates to profile settings", async () => {
    const user = userEvent.setup()

    render(
      <UserMenu avatar="" name="Admin" userRole="Owner" onLogout={() => {}} />,
    )

    await user.click(screen.getByRole("button", { name: /user menu/i }))
    await user.click(screen.getByText("Profile Settings"))

    expect(push).toHaveBeenCalledWith("/admin/dashboard/settings")
  })
})