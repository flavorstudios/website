import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MobileMegaMenu } from "@/components/mobile-mega-menu"
import type { MenuItem } from "@/components/mega-menu"

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}))

describe("MobileMegaMenu keyboard interactions", () => {
  const items: MenuItem[] = [
    {
      label: "Menu",
      subItems: [
        { label: "First", href: "/first" },
        { label: "Second", href: "/second" },
      ],
    },
  ]

  it("opens with Enter and closes with Escape while managing focus", async () => {
    const user = userEvent.setup()
    render(<MobileMegaMenu items={items} />)

    const toggle = screen.getByRole("button", { name: "Menu" })
    toggle.focus()

    await user.keyboard("{Enter}")

    const firstLink = await screen.findByRole("link", { name: "First" })
    await waitFor(() => expect(firstLink).toHaveFocus())

    await user.keyboard("{Escape}")
    await waitFor(() => expect(toggle).toHaveFocus())
    expect(toggle).toHaveAttribute("aria-expanded", "false")
  })

  it("opens with Space and Shift+Tab returns focus to toggle", async () => {
    const user = userEvent.setup()
    render(<MobileMegaMenu items={items} />)

    const toggle = screen.getByRole("button", { name: "Menu" })
    toggle.focus()

    await user.keyboard(" ")

    const firstLink = await screen.findByRole("link", { name: "First" })
    await waitFor(() => expect(firstLink).toHaveFocus())

    await user.keyboard("{Shift>}{Tab}{/Shift}")
    await waitFor(() => expect(toggle).toHaveFocus())
  })
})