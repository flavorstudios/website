// tests/axe-helper.ts
import { expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Run axe against the current page and fail the test on any violations.
 * Optionally scope to one or more selectors via `include`.
 */
export async function expectNoAxeViolations(
  page: Page,
  opts?: { include?: string | string[] }
) {
  let builder = new AxeBuilder({ page });

  if (opts?.include) {
    const sel = Array.isArray(opts.include) ? opts.include : [opts.include];
    for (const s of sel) builder = builder.include(s);
  }

  const { violations } = await builder.analyze();

  if (violations.length) {
    // Helpful output in CI logs
    console.log("Axe violations:", JSON.stringify(violations, null, 2));
  }

  expect(violations).toEqual([]);
}
