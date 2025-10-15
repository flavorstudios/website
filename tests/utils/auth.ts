import { Page } from "@playwright/test";

export const setE2EAuthCookie = async (page: Page) => {
  await page.context().addCookies([
    {
      name: "e2e-admin",
      value: "true",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
};
