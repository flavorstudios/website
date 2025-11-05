import { test, expect } from "@playwright/test";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";

const ADMIN_ROUTE_ROOTS = ["app/(admin)", "app/admin"] as const;
const PAGE_FILENAMES = new Set([
  "page.tsx",
  "page.ts",
  "page.jsx",
  "page.js",
  "page.mdx",
  "page.md",
]);

function normalise(file: string) {
  return file.split(path.sep).join("/");
}

function segmentToRoutePart(segment: string): string | null {
  if (!segment) return null;
  if (segment.startsWith("(")) return null;
  if (segment.startsWith("@")) return null;
  if (segment.startsWith("_")) return null;
  if (PAGE_FILENAMES.has(segment)) return null;
  if (segment.includes(".")) return segment;
  return segment;
}

function filePathToRoute(file: string): string | null {
  const normalized = normalise(file);
  const match = normalized.match(/app\/(?:\(admin\)|admin)\/(.*)\/page\.(?:tsx|ts|jsx|js|mdx?)$/);
  if (!match) {
    return null;
  }
  const matchedSegments = match[1];
  if (typeof matchedSegments !== "string") {
    return null;
  }
  const segments = matchedSegments
    .split("/")
    .map(segmentToRoutePart)
    .filter((part): part is string => part != null);
  const routePath = ["admin", ...segments].join("/");
  const clean = `/${routePath}`.replace(/\/+$/, "");
  return clean || "/admin";
}

function discoverRoutes() {
  const collected: string[] = [];

  function walk(dir: string) {
    let entries: string[] = [];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      let stats;
      try {
        stats = statSync(fullPath);
      } catch {
        continue;
      }
      if (stats.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (PAGE_FILENAMES.has(entry)) {
        collected.push(fullPath);
      }
    }
  }

  for (const root of ADMIN_ROUTE_ROOTS) {
    const absRoot = path.resolve(root);
    walk(absRoot);
  }

  const routes = new Set<string>();
  for (const file of collected) {
    const route = filePathToRoute(file);
    if (route && !route.includes("[")) {
      routes.add(route);
    }
  }

  const list = Array.from(routes);
  list.sort();
  return list.length > 0
    ? list
    : [
        "/admin/dashboard",
        "/admin/blogs",
        "/admin/videos",
        "/admin/media",
        "/admin/categories",
        "/admin/comments",
        "/admin/applications",
        "/admin/email",
        "/admin/users",
      ];
}

const routes = discoverRoutes();

for (const route of routes) {
  test(`exactly one H1 on ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    const roleCount = await page.getByRole("heading", { level: 1 }).count();
    const tagCount = await page.locator("h1").count();

    const h1Texts: string[] = [];
    for (let i = 0; i < tagCount; i += 1) {
      h1Texts.push(await page.locator("h1").nth(i).innerText());
    }

    test.info().attach(`h1-on-${route}`, {
      body: Buffer.from(h1Texts.join("\n"), "utf-8"),
      contentType: "text/plain",
    });

    expect(roleCount, `Duplicate level 1 headings on ${route}.\nH1 texts:\n${h1Texts.join("\n")}`).toBe(1);
    expect(tagCount, `Duplicate <h1> tags on ${route}.\nH1 texts:\n${h1Texts.join("\n")}`).toBe(1);
  });
}