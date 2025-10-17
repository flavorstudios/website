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
  const files = collectHtmlFiles(".next/server/app/(admin)");
  let failed = false;
  for (const f of files) {
    const html = readFileSync(f, "utf8");
    const count = (html.match(/<h1\b/gi) || []).length;
    if (count !== 1) {
      console.error(`Expected 1 <h1>, found ${count} in ${f}`);
      failed = true;
    }
  }
  if (failed) process.exit(1);
}

main();