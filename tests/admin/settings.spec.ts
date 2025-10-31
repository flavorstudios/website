import { test, expect } from "@playwright/test"

const SETTINGS_URL = "/admin/dashboard/settings"

test.describe("admin settings tabs", () => {
  test("deep linking activates correct tab and updates query", async ({ page }) => {
    await page.goto(`${SETTINGS_URL}?tab=appearance`)
    const appearanceTab = page.getByRole("tab", { name: "Appearance" })
    await expect(appearanceTab).toHaveAttribute("data-state", "active")

    await page.getByRole("tab", { name: "Notifications" }).click()
    await expect(page).toHaveURL(/\?tab=notifications$/)
  })
})