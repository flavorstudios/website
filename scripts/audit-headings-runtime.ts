import { mkdir, readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright";
import { load as loadHtml } from "cheerio";

type AuditMode = "browser" | "ssr";

interface RouteResult {
  route: string;
  h1Count: number;
  roleCount: number;
  headings: string[];
  outerHTML: string[];
  ssrCount?: number;
  ssrHeadings?: string[];
  statusCode?: number;
  mode: AuditMode;
}

const PORT = Number(process.env.AUDIT_HEADINGS_PORT ?? 4310);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const ARTIFACT_DIR = path.join(process.cwd(), ".artifacts");

function normalise(file: string) {
  return file.split(path.sep).join("/");
}

function segmentToRoutePart(segment: string): string | null {
  if (!segment) return null;
  if (segment.startsWith("(")) return null;
  if (segment.startsWith("@")) return null;
  if (segment.startsWith("_")) return null;
  if (segment === "page.tsx" || segment === "page.ts" || segment === "page.jsx" || segment === "page.js") {
    return null;
  }
  if (segment.includes(".")) return segment; // for parallel routes keep file portion as fallback
  return segment;
}

function filePathToRoute(file: string): string | null {
  const normalized = normalise(file);
  const match = normalized.match(/app\/(?:\(admin\)|admin)\/(.*)\/page\.(?:tsx|ts|jsx|js|mdx?)$/);
  if (!match) {
    return null;
  }
  const segments = match[1]
    .split("/")
    .map(segmentToRoutePart)
    .filter((part): part is string => part != null);
  const fullSegments = ["admin", ...segments];
  const path = `/${fullSegments.filter(Boolean).join("/")}`.replace(/\/+$/, "");
  return path || "/admin";
}

const ADMIN_ROUTE_ROOTS = ["app/(admin)", "app/admin"];
const PAGE_FILENAMES = new Set([
  "page.tsx",
  "page.ts",
  "page.jsx",
  "page.js",
  "page.mdx",
  "page.md",
]);

async function discoverRoutes() {
  const files: string[] = [];

  async function walk(dir: string) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }
      if (PAGE_FILENAMES.has(entry.name)) {
        files.push(path.resolve(fullPath));
      }
    }
  }

  for (const root of ADMIN_ROUTE_ROOTS) {
    const absRoot = path.resolve(root);
    if (existsSync(absRoot)) {
      await walk(absRoot);
    }
  }

  const routes = new Set<string>();
  for (const file of files) {
    const route = filePathToRoute(file);
    if (route) {
      routes.add(route || "/admin");
    }
  }
  const list = [...routes].map((route) => (route === "" ? "/admin" : route));
  list.sort();
  return list;
}

async function waitForServerReady() {
  const timeoutMs = Number(process.env.AUDIT_HEADINGS_TIMEOUT ?? 60_000);
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE_URL}/admin`);
      if (res.ok || res.status === 404 || res.status === 401) {
        return;
      }
    } catch {
      // ignore until ready
    }
    await delay(500);
  }
  throw new Error(`Admin app failed to start on ${BASE_URL} within ${timeoutMs}ms`);
}

async function startDevServer() {
  const env = {
    ...process.env,
    PORT: String(PORT),
    E2E: process.env.E2E ?? "true",
    NEXT_PUBLIC_E2E: process.env.NEXT_PUBLIC_E2E ?? "true",
  };

  const nextBin = path.join("node_modules", ".bin", process.platform === "win32" ? "next.cmd" : "next");
  const useNextBin = existsSync(nextBin);

  const command = useNextBin ? nextBin : "pnpm";
  const args = useNextBin
    ? ["dev", "-p", String(PORT)]
    : ["exec", "next", "dev", "-p", String(PORT)];

  const server = spawn(command, args, {
    env: useNextBin
      ? env
      : {
          ...env,
          COREPACK_ENABLE_DOWNLOAD: "0",
        },
    shell: false,
  });

  server.stdout.setEncoding("utf8");
  server.stderr.setEncoding("utf8");
  server.stdout.on("data", (chunk) => {
    process.stdout.write(chunk);
  });
  server.stderr.on("data", (chunk) => {
    process.stderr.write(chunk);
  });

  await waitForServerReady();
  return server;
}

async function stopDevServer(server: ReturnType<typeof spawn>) {
  return new Promise<void>((resolve) => {
    server.once("exit", () => resolve());
    server.kill();
  });
}

function screenshotName(route: string) {
  if (route === "") return "headings_root.png";
  return `headings${route.replace(/\//g, "_") || "_admin"}.png`;
}

async function readSSRHtml(route: string) {
  const variants = [
    path.join(".next", "server", "app", route === "/admin" ? "admin" : route.slice(1), "index.html"),
    path.join(".next", "server", "app", route === "/admin" ? "admin" : route.slice(1) + ".html"),
  ];
  for (const candidate of variants) {
    if (existsSync(candidate)) {
      try {
        const html = await readFile(candidate, "utf8");
        const match = html.match(/<h1[\s\S]*?<\/h1>/gi) || [];
        return {
          count: match.length,
          headings: match.map((node) => node.replace(/<[^>]+>/g, "").trim()),
        };
      } catch {
        // ignore
      }
    }
  }
  return null;
}

async function auditRoutesWithBrowser(routes: string[]) {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const results: RouteResult[] = [];
  try {
    for (const route of routes) {
      const page = await browser.newPage();
      const url = `${BASE_URL}${route}`;
      await page.goto(url, { waitUntil: "networkidle" });
      const response = await page.goto(url, { waitUntil: "networkidle" });

      const h1Locator = page.locator("h1");
      const roleLocator = page.getByRole("heading", { level: 1 });
      const h1Count = await h1Locator.count();
      const roleCount = await roleLocator.count();

      const headings: string[] = [];
      const outerHTML: string[] = [];
      for (let index = 0; index < h1Count; index += 1) {
        const el = h1Locator.nth(index);
        const text = await el.innerText();
        headings.push(text.trim());
        const html = await el.evaluate((node) => node.outerHTML);
        outerHTML.push(html);
        console.log(`[${route}] H1 #${index + 1}: ${html}`);
      }

      const screenshotPath = path.join(ARTIFACT_DIR, screenshotName(route));
      await page.screenshot({ path: screenshotPath, fullPage: true });

      const ssrInfo = await readSSRHtml(route);

      results.push({
        route: route || "/admin",
        h1Count,
        roleCount,
        headings,
        outerHTML,
        ssrCount: ssrInfo?.count,
        ssrHeadings: ssrInfo?.headings,
        mode: "browser",
        statusCode: response?.status(),
      });

      await page.close();
    }
  } finally {
    await browser.close();
  }
  return results;
}

async function auditRoutesWithFetch(routes: string[]) {
  const results: RouteResult[] = [];
  for (const route of routes) {
    const url = `${BASE_URL}${route}`;
    let response: Response | null = null;
    try {
      response = await fetch(url);
    } catch (error) {
      console.error(`Failed to fetch ${url}:`, error);
      results.push({
        route: route || "/admin",
        h1Count: 0,
        roleCount: 0,
        headings: [],
        outerHTML: [],
        ssrCount: 0,
        ssrHeadings: [],
        mode: "ssr",
        statusCode: undefined,
      });
      continue;
    }

    const html = await response.text();
    const $ = loadHtml(html);
    const h1Elements = $("h1");
    const headings: string[] = [];
    const outerHTML: string[] = [];
    h1Elements.each((_, element) => {
      const text = $(element).text().trim();
      headings.push(text);
      outerHTML.push($.html(element));
      console.log(`[${route}] H1 SSR: ${$.html(element)}`);
    });

    results.push({
      route: route || "/admin",
      h1Count: h1Elements.length,
      roleCount: h1Elements.length,
      headings,
      outerHTML,
      ssrCount: h1Elements.length,
      ssrHeadings: headings,
      mode: "ssr",
      statusCode: response.status,
    });
  }
  return results;
}

function printResults(results: RouteResult[]) {
  const header = ["Route", "Mode", "Status", "<h1> count", "Role count", "Headings"];
  const rows = results.map((result) => [
    result.route,
    result.mode,
    result.statusCode != null ? String(result.statusCode) : "-",
    String(result.h1Count),
    String(result.roleCount),
    result.headings.join(" | ") || "(none)",
  ]);
  const table = [header, ...rows];
  const widths = header.map((_, columnIndex) =>
    Math.max(...table.map((row) => String(row[columnIndex]).length))
  );
  const lines = table.map((row, rowIndex) =>
    row
      .map((cell, columnIndex) => String(cell).padEnd(widths[columnIndex]))
      .join("  ") +
    (rowIndex === 0 ? "\n" + widths.map((w) => "-".repeat(w)).join("  ") : "")
  );
  console.log(lines.join("\n"));
}

async function main() {
  const routes = await discoverRoutes();
  if (routes.length === 0) {
    console.log("No admin routes discovered.");
    return;
  }

  const server = await startDevServer();
  let results: RouteResult[] = [];
  let usedFallback = false;
  try {
    try {
      results = await auditRoutesWithBrowser(routes);
    } catch (error) {
      usedFallback = true;
      console.warn(
        "Playwright failed to launch. Falling back to SSR HTML audit.",
        error instanceof Error ? error.message : error
      );
      results = await auditRoutesWithFetch(routes);
    }
  } finally {
    await stopDevServer(server);
  }

  printResults(results);

  if (usedFallback) {
    console.warn(
      "SSR fallback mode omits client-rendered headings. Install Playwright browsers for full coverage."
    );
  }

  const offenders = results.filter((result) => {
    if (result.statusCode != null && result.statusCode >= 400) {
      return false;
    }
    return result.h1Count !== 1 || result.roleCount !== 1;
  });
  if (offenders.length > 0) {
    console.error("\nRoutes with invalid heading counts:");
    for (const offender of offenders) {
      console.error(
        ` - ${offender.route} (status ${offender.statusCode ?? "unknown"}): <h1>=${offender.h1Count}, role level=1=${offender.roleCount} :: ${offender.headings.join(", ")}`
      );
    }
    process.exitCode = 1;
  }
}

await main();