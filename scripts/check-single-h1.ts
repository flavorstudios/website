import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

function collectHtmlFiles(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }

  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectHtmlFiles(fullPath));
      continue;
    }

    if (entry.isFile() && fullPath.endsWith(".html")) {
      files.push(fullPath);
    }
  }

  return files;
}

async function main() {
  const roots = [".next/server/app/(admin)", ".next/server/app/admin"];
  const files = roots.flatMap((root) => collectHtmlFiles(root));
  let failed = false;
  for (const f of files) {
    const html = readFileSync(f, "utf8");
    const matches = [...html.matchAll(/<h1[^>]*>/gi)];
    const count = matches.length;
    if (count !== 1) {
      console.error(`Expected 1 <h1>, found ${count} in ${f}`);
      matches.forEach((match) => {
        const index = match.index ?? 0;
        const start = Math.max(0, index - 150);
        const end = Math.min(html.length, index + 150);
        const context = html
          .slice(start, end)
          .replace(/\s+/g, " ")
          .trim();
        console.error(`  snippet: ${context}`);
      });
      failed = true;
    }
  }
  if (failed) process.exit(1);
}

main();