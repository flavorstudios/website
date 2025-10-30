// tests/test-setup.ts (or e2e/test-setup.ts, same idea)
import { test as base } from '@playwright/test';
import { applyGlobalMocks } from './setup/global.mock';

type TestFixtures = {
  /**
   * If true, global network mocks will run before each test.
   * In tests that need to hit the real route or set their own route,
   * do:
   *
   *   test.use({ useGlobalMocks: false });
   */
  useGlobalMocks: boolean;
};

export const test = base.extend<TestFixtures>({
  // default behaviour stays the same as before: mocks are enabled
  useGlobalMocks: [true, { option: true }],
});

export const expect = test.expect;

// optional convenience for tests that never want mocks
export const testNoMocks = test.extend<TestFixtures>({
  useGlobalMocks: [false, { option: true }],
});

test.beforeEach(async ({ page, useGlobalMocks }) => {
  if (useGlobalMocks) {
    await applyGlobalMocks(page);
  }
});
