describe('isTestMode', () => {
  const originalEnv = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_TEST_MODE: process.env.NEXT_PUBLIC_TEST_MODE,
  };

  afterEach(() => {
    jest.resetModules();
    if (originalEnv.NODE_ENV === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalEnv.NODE_ENV;

    if (originalEnv.NEXT_PUBLIC_TEST_MODE === undefined) {
      delete process.env.NEXT_PUBLIC_TEST_MODE;
    } else {
      process.env.NEXT_PUBLIC_TEST_MODE = originalEnv.NEXT_PUBLIC_TEST_MODE;
    }
  });

  async function loadFlags() {
    jest.resetModules();
    return import('../config/flags');
  }

  it('is false by default', async () => {
    delete process.env.NEXT_PUBLIC_TEST_MODE;
    process.env.NODE_ENV = 'development';
    const { isTestMode } = await loadFlags();
    expect(isTestMode()).toBe(false);
  });

  it('is true when NEXT_PUBLIC_TEST_MODE=1 and NODE_ENV=development', async () => {
    process.env.NODE_ENV = 'development';
    process.env.NEXT_PUBLIC_TEST_MODE = '1';
    const { isTestMode } = await loadFlags();
    expect(isTestMode()).toBe(true);
  });

  it('is false when NEXT_PUBLIC_TEST_MODE=1 but NODE_ENV=production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.NEXT_PUBLIC_TEST_MODE = '1';
    const { isTestMode } = await loadFlags();
    expect(isTestMode()).toBe(false);
  });

  it('ignores truthy strings other than 1', async () => {
    process.env.NODE_ENV = 'development';
    process.env.NEXT_PUBLIC_TEST_MODE = 'true';
    const { isTestMode } = await loadFlags();
    expect(isTestMode()).toBe(false);
  });
});