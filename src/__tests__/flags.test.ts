type Mutable<T> = { -readonly [K in keyof T]: T[K] };
type MutableProcessEnv = Mutable<NodeJS.ProcessEnv>;

const mutableEnv = process.env as MutableProcessEnv;

function setEnv(name: string, value: string | undefined) {
  if (value === undefined) {
    delete mutableEnv[name];
  } else {
    mutableEnv[name] = value;
  }
}

describe('isTestMode', () => {
  const originalEnv = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_TEST_MODE: process.env.NEXT_PUBLIC_TEST_MODE,
  };

  afterEach(() => {
    jest.resetModules();
    setEnv('NODE_ENV', originalEnv.NODE_ENV);
    setEnv('NEXT_PUBLIC_TEST_MODE', originalEnv.NEXT_PUBLIC_TEST_MODE);
  });

  async function loadFlags() {
    jest.resetModules();
    return import('../config/flags');
  }

  it('is false by default', async () => {
    setEnv('NEXT_PUBLIC_TEST_MODE', undefined);
    setEnv('NODE_ENV', 'development');
    const { isTestMode } = await loadFlags();
    expect(isTestMode()).toBe(false);
  });

  it('is true when NEXT_PUBLIC_TEST_MODE=1 and NODE_ENV=development', async () => {
    setEnv('NODE_ENV', 'development');
    setEnv('NEXT_PUBLIC_TEST_MODE', '1');
    const { isTestMode } = await loadFlags();
    expect(isTestMode()).toBe(true);
  });

  it('is false when NEXT_PUBLIC_TEST_MODE=1 but NODE_ENV=production', async () => {
    setEnv('NODE_ENV', 'production');
    setEnv('NEXT_PUBLIC_TEST_MODE', '1');
    const { isTestMode } = await loadFlags();
    expect(isTestMode()).toBe(false);
  });

  it('ignores truthy strings other than 1', async () => {
    setEnv('NODE_ENV', 'development');
    setEnv('NEXT_PUBLIC_TEST_MODE', 'true');
    const { isTestMode } = await loadFlags();
    expect(isTestMode()).toBe(false);
  });
});