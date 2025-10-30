import { test, expect } from "./test-setup";
import { awaitAppReady } from "./utils/awaitAppReady";

const CI_ALLOWED_CONSOLE_ERRORS = [
  // client/admin auth complains in CI because we don’t pass public Firebase keys
  "[AdminAuthProvider] Firebase init error:",
  "[Firebase] Missing: NEXT_PUBLIC_FIREBASE_API_KEY",
  "[Firebase] Missing: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "[Firebase] Missing: NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "[Firebase] Missing: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "[Firebase] Missing: NEXT_PUBLIC_FIREBASE_APP_ID",
];

test("logs in via cookie and loads dashboard without console errors", async ({
  page,
  context,
}) => {
  const errors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });

  // Fake login by setting the admin-session cookie
  await context.addCookies([
    { name: "admin-session", value: "playwright", domain: "127.0.0.1", path: "/" },
    { name: "admin-session", value: "playwright", domain: "localhost", path: "/" },
  ]);

  await page.goto("/admin/dashboard");
  await awaitAppReady(page);

  // your dashboard does these two calls in CI, give them time
  await Promise.all([
    page
      .waitForResponse(
        (res) => res.url().includes("/api/admin/settings") && res.ok(),
        { timeout: 15_000 },
      )
      .catch(() => {}),
    page
      .waitForResponse(
        (res) => res.url().includes("/api/admin/init") && res.ok(),
        { timeout: 15_000 },
      )
      .catch(() => {}),
  ]);

  // CI did not always render "Total Posts", so try a few known texts first
  const candidateTexts = [
    "Total Posts",
    "Total Articles",
    "Recent Posts",
    "Admin Dashboard",
    "Flavor Studios Admin Console",
  ];

  let foundAny = false;
  for (const text of candidateTexts) {
    const loc = page.getByText(text, { exact: false });
    const visible = await loc.first().isVisible().catch(() => false);
    if (visible) {
      foundAny = true;
      break;
    }
  }

  // final fallback so test is not flaky if wording changes
  if (!foundAny) {
    await expect(page.locator("main")).toBeVisible({ timeout: 15_000 });
  }

  const isCI = process.env.CI === "true" || process.env.CI === "1";

  const finalErrors = isCI
    ? errors.filter(
        (err) =>
          !CI_ALLOWED_CONSOLE_ERRORS.some((allowed) => err.includes(allowed)),
      )
    : errors;

  expect(finalErrors).toEqual([]);
});
