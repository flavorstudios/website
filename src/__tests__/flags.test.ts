import type { EnvOverrides } from '@/test-utils/env';
import { withEnv } from '@/test-utils/env';

describe('isTestMode', () => {
  async function loadFlags(overrides: EnvOverrides) {
    return withEnv(overrides, async () => {
      jest.resetModules();
      return import('../config/flags');
    });
  }

  it('is false by default', async () => {
    const { isTestMode } = await loadFlags({
      NEXT_PUBLIC_TEST_MODE: undefined,
      NODE_ENV: 'development',
    });
    expect(isTestMode()).toBe(false);
  });

  it('is true when NEXT_PUBLIC_TEST_MODE=1 and NODE_ENV=development', async () => {
    const { isTestMode } = await loadFlags({
      NODE_ENV: 'development',
      NEXT_PUBLIC_TEST_MODE: '1',
    });
    expect(isTestMode()).toBe(true);
  });

  it('is false when NEXT_PUBLIC_TEST_MODE=1 but NODE_ENV=production', async () => {
    const { isTestMode } = await loadFlags({
      NODE_ENV: 'production',
      NEXT_PUBLIC_TEST_MODE: '1',
    });
    expect(isTestMode()).toBe(false);
  });

  it('ignores truthy strings other than 1', async () => {
    const { isTestMode } = await loadFlags({
      NODE_ENV: 'development',
      NEXT_PUBLIC_TEST_MODE: 'true',
    });
    expect(isTestMode()).toBe(false);
  });
});