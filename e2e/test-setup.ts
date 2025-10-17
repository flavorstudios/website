import { test as base } from '@playwright/test';
import { applyGlobalMocks } from './setup/global.mock';

export const test = base.extend({});
export const expect = test.expect;

test.beforeEach(async ({ page }) => {
  await applyGlobalMocks(page);
});