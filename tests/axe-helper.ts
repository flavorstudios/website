import { Page } from '@playwright/test';
import { injectAxe, checkA11y } from '@axe-core/playwright';

export async function runA11yScan(page: Page, context = 'page') {
  await injectAxe(page);
  await checkA11y(page, undefined, {
    axeOptions: { runOnly: ['wcag2a', 'wcag2aa'] },
    detailedReport: true,
    detailedReportOptions: { html: true }
  });
}
