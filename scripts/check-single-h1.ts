import { readFileSync } from "node:fs";

async function getMatcher() {
  try {
    const mod = await import("globby");
    return mod.globby as (patterns: string[]) => Promise<string[]>;
  } catch {
    const mod = await import("tinyglobby");
    return mod.globby as (patterns: string[]) => Promise<string[]>;
  }
}

async function main() {
  const globby = await getMatcher();
  const files = await globby([".next/server/app/(admin)/**/*.html"]);
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