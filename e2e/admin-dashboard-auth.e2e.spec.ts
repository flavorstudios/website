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

  // collect console errors so we can filter CI-only noise later
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

  // go to the dashboard
  await page.goto("/admin/dashboard");

  // new helper knows how to wait for admin dashboard root in CI
  await awaitAppReady(page, { admin: true });

  // deterministic anchor for CI/e2e (rendered by the page when CI-like)
  await expect(page.getByTestId("admin-dashboard-root")).toBeVisible({
    timeout: 15_000,
  });

  // in CI we allow the known noisy errors only
  const isCI = process.env.CI === "true" || process.env.CI === "1";
  const finalErrors = isCI
    ? errors.filter(
        (err) =>
          !CI_ALLOWED_CONSOLE_ERRORS.some((allowed) => err.includes(allowed)),
      )
    : errors;

  expect(finalErrors).toEqual([]);
});
