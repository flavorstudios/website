import type { Meta, StoryObj } from "@storybook/react"
import { AdminHeader } from "./admin-header"

const meta: Meta<typeof AdminHeader> = {
  title: "Admin/AdminHeader",
  component: AdminHeader,
  parameters: { layout: "fullscreen" },
}
export default meta

type Story = StoryObj<typeof AdminHeader>

export const Default: Story = {
  args: {
    onLogout: () => {},
    sidebarOpen: false,
    setSidebarOpen: () => {},
  },
}