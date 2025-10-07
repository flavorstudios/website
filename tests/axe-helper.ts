// tests/axe-helper.ts
import { expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/** Analyze the current page with axe and fail on any violations. */
export async function expectNoAxeViolations(
  page: Page,
  opts?: { include?: string | string[] }
) {
  await page.waitForLoadState("networkidle");
  let builder = new AxeBuilder({ page });

  if (opts?.include) {
    const sels = Array.isArray(opts.include) ? opts.include : [opts.include];
    const labelOnly: string[] = [];

    for (const rawSel of sels) {
      const sel = rawSel.trim();
      if (!sel) continue;

      try {
        const handle = await page.$(sel);
        if (handle) {
          await handle.dispose();
          builder = builder.include(sel);
        } else {
          labelOnly.push(sel);
          console.warn(
            `[axe-helper] No elements matched include "${sel}"; treating as label-only.`
          );
        }
      } catch (error) {
        console.warn(
          `[axe-helper] Skipping include "${sel}" due to selector error: ${
            error instanceof Error ? error.message : error
          }`
        );
      }
    }

    if (labelOnly.length) {
      console.log(
        `[axe-helper] Axe scan labels: ${labelOnly
          .map((label) => `"${label}"`)
          .join(', ')}`
      );
    }
  }

  const { violations } = await builder.analyze();

  if (violations.length) {
    // Nice readable output in CI
    console.log("Axe violations:", JSON.stringify(violations, null, 2));
  }

  expect(violations).toEqual([]);
}

/** Backward-compat alias for older tests that import { runA11yScan } */
export async function runA11yScan(
  page: Page,
  opts?: { include?: string | string[] }
) {
  await expectNoAxeViolations(page, opts);
}
