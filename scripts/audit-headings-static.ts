import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";

interface Issue {
  file: string;
  line: number;
  reason: string;
  severity: "error" | "warn";
}

const SEARCH_ROOTS = [
  "app/(admin)",
  "app/admin",
  "components",
];
const ALLOWED_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".md", ".mdx"]);
const PAGE_HEADER_PATH = path.normalize("components/admin/page-header.tsx");
const ALLOWED_LEVEL_ONE_COMPONENTS = new Set([
  "app/admin/dashboard/AdminDashboardSectionPage.tsx",
]);

const COMPONENT_H1_ALLOWLIST = new Set([
  "components/blog/BlogRenderer.tsx",
  "components/blog/blog-header.tsx",
  "components/home/HeroSection.tsx",
]);

const RISKY_COMPONENT_HINTS = new Set([
  "layout",
  "template",
  "header",
  "hero",
  "shell",
  "navbar",
  "breadcrumb",
  "breadcrumbs",
  "card",
]);

function normaliseFilePath(file: string) {
  const relative = path.relative(process.cwd(), file);
  return relative.split(path.sep).join("/");
}

function isAdminLayoutOrTemplate(file: string) {
  const normalized = normaliseFilePath(file);
  return (
    /app\/(?:\(admin\)|admin)\//.test(normalized) &&
    /(\/(layout|template)\.(ts|tsx|js|jsx|mdx?))$/.test(normalized)
  );
}

function isAdminPageFile(file: string) {
  const normalized = normaliseFilePath(file);
  return /app\/(?:\(admin\)|admin)\/.+\/page\.(ts|tsx|js|jsx|mdx?)$/.test(normalized);
}

function isComponentsFile(file: string) {
  const normalized = normaliseFilePath(file);
  return normalized.startsWith("components/");
}

function looksAdminComponent(file: string) {
  const normalized = normaliseFilePath(file);
  if (normalized === PAGE_HEADER_PATH) return false;
  if (normalized.startsWith("components/admin/")) return true;
  // Also treat shared chrome pieces as risky if hints appear in path segments
  const segments = normalized.split("/");
  return segments.some((segment) => RISKY_COMPONENT_HINTS.has(segment.replace(/\.[^.]+$/, "")));
}

function buildLineIndex(content: string) {
  const positions: number[] = [0];
  for (let i = 0; i < content.length; i += 1) {
    if (content[i] === "\n") {
      positions.push(i + 1);
    }
  }
  return positions;
}

function locateLine(positions: number[], index: number) {
  let left = 0;
  let right = positions.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (positions[mid] <= index) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return right + 1;
}

function pushIssue(
  issues: Issue[],
  file: string,
  linePositions: number[],
  index: number,
  reason: string,
  severity: Issue["severity"] = "error"
) {
  issues.push({
    file: normaliseFilePath(file),
    line: locateLine(linePositions, index),
    reason,
    severity,
  });
}

async function scanFile(file: string, issues: Issue[], pageHeaderUsage: Map<string, number>) {
  const content = await readFile(file, "utf8");
  const linePositions = buildLineIndex(content);
  const normalized = normaliseFilePath(file);
  const isLayout = isAdminLayoutOrTemplate(file);
  const isPage = isAdminPageFile(file);
  const isComponent = isComponentsFile(file);
  const allowLevelOne = ALLOWED_LEVEL_ONE_COMPONENTS.has(normalized);

  const riskyMatch = /<\s*h1\b/gi;
  const metadataMatch = /metadata\s*\.\s*title/;
  const typographyMatch = /TypographyH1|<\s*H1\b|typography-h1|HeadingH1/;
  const mdxMapMatch = /h1\s*:/;

  for (const match of content.matchAll(riskyMatch)) {
    const index = match.index ?? 0;
    const isAllowedComponentH1 = COMPONENT_H1_ALLOWLIST.has(normalized);
    const reason = isLayout
      ? "Admin layout/template must not render <h1>"
      : isComponent
        ? "Shared component renders <h1>"
        : "<h1> found";
    const severity =
      isLayout || (isComponent && !isAllowedComponentH1) || looksAdminComponent(file)
        ? "error"
        : "warn";
    pushIssue(issues, file, linePositions, index, reason, severity);
  }

  if (isLayout && /<\s*PageHeader\b/.test(content)) {
    const index = content.indexOf("<PageHeader");
    pushIssue(
      issues,
      file,
      linePositions,
      index,
      "Admin layout/template must not render PageHeader",
      "error"
    );
  }

  if (isLayout && metadataMatch.test(content)) {
    const index = content.indexOf("metadata.title");
    pushIssue(
      issues,
      file,
      linePositions,
      index,
      "metadata.title should not be rendered visibly in admin layout/template",
      "warn"
    );
  }

  if (looksAdminComponent(file) && typographyMatch.test(content)) {
    const index = content.search(typographyMatch);
    pushIssue(
      issues,
      file,
      linePositions,
      index,
      "Possible typography helper rendering <h1> in admin shell",
      "warn"
    );
  }

  if (/app\/(?:\(admin\)|admin)\//.test(normalized) && mdxMapMatch.test(content)) {
    const index = content.search(mdxMapMatch);
    pushIssue(
      issues,
      file,
      linePositions,
      index,
      "MDX provider maps h1 inside admin scope",
      "warn"
    );
  }

  // Track PageHeader usage
  const tagRegex = /<PageHeader\b([\s\S]*?)(?:\/?>)/g;
  let match: RegExpExecArray | null;
  while ((match = tagRegex.exec(content))) {
    const start = match.index ?? 0;
    const attrs = match[1] ?? "";
    const hasLevel = /level\s*=/.test(attrs);
    const levelIsOne = hasLevel ? /level\s*=\s*\{?\s*1\b/.test(attrs) : true;
    const reason = `PageHeader level={1} usage`;
    if (levelIsOne) {
      const severity = isPage || allowLevelOne ? "warn" : "error";
      pushIssue(issues, file, linePositions, start, reason, severity);
      if (isPage) {
        const current = pageHeaderUsage.get(normalized) ?? 0;
        pageHeaderUsage.set(normalized, current + 1);
      }
    }
  }
}

async function main() {
  const files = new Set<string>();
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
      const ext = path.extname(entry.name).toLowerCase();
      if (!ALLOWED_EXTENSIONS.has(ext)) continue;
      if (!existsSync(fullPath)) continue;
      files.add(path.resolve(fullPath));
    }
  }

  for (const root of SEARCH_ROOTS) {
    const absoluteRoot = path.resolve(root);
    if (existsSync(absoluteRoot)) {
      await walk(absoluteRoot);
    }
  }

  const issues: Issue[] = [];
  const pageHeaderUsage = new Map<string, number>();

  for (const file of files) {
    await scanFile(file, issues, pageHeaderUsage);
  }

  for (const [file, count] of pageHeaderUsage.entries()) {
    if (count > 1) {
      issues.push({
        file,
        line: 0,
        reason: `PageHeader level={1} appears ${count} times in the same page file`,
        severity: "error",
      });
    }
  }

  if (issues.length === 0) {
    console.log("No risky heading patterns detected in admin files.");
    return;
  }

  const rows = issues
    .sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)
    .map((issue) => [issue.severity.toUpperCase(), issue.file, issue.line || "-", issue.reason]);

  const header = ["Severity", "File", "Line", "Reason"];
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

  const hasError = issues.some((issue) => issue.severity === "error");
  if (hasError) {
    process.exitCode = 1;
  }
}

await main();