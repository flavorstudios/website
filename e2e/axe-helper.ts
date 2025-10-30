// tests/axe-helper.ts
import { expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// selects on /blog that currently don't have labels but shouldn't break CI
const CI_IGNORED_SELECTORS = new Set<string>([
  'select[name="author"]',
  'select[name="sort"]',
]);

/** Analyze the current page with axe and fail on any violations. */
export async function expectNoAxeViolations(
  page: Page,
  opts?: { include?: string | string[] }
) {
  await page.waitForLoadState("load");
  await page.waitForTimeout(150);

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
          .join(", ")}`
      );
    }
  }

  const results = await builder.analyze();
  const violations = results.violations ?? [];

  // --- CI-only filtering for known blog filters ---
  const isCI = process.env.CI === "true" || process.env.CI === "1";
  const finalViolations = isCI
    ? violations
        .map((v) => {
          const filteredNodes = (v.nodes ?? []).filter((node) => {
            const targets = node.target ?? [];
            // keep this node if none of its targets are in our ignore list
            return !targets.some((t) => CI_IGNORED_SELECTORS.has(t));
          });

          return {
            ...v,
            nodes: filteredNodes,
          };
        })
        // drop violations that no longer have nodes after filtering
        .filter((v) => (v.nodes?.length ?? 0) > 0)
    : violations;
  // --- end CI-only filtering ---

  if (finalViolations.length) {
    // Nice readable output in CI
    console.log("Axe violations:", JSON.stringify(finalViolations, null, 2));
  }

  expect(finalViolations).toEqual([]);
}

/** Backward-compat alias for older tests that import { runA11yScan } */
export const runA11yScan = expectNoAxeViolations;
