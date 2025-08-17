import AxeBuilder from '@axe-core/playwright';
import { expect, Page } from '@playwright/test';

export async function runA11yScan(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
}
