/**
 * @jest-environment node
 */
export {};

process.env.PREVIEW_SECRET = 'test-secret';
const envModule = require("@/env/server");
envModule.serverEnv.PREVIEW_SECRET = "test-secret";
const {
  createPreviewToken,
  validatePreviewToken,
  inspectPreviewToken,
} = require("../preview-token");

const setProcessEnv = (key: string, value: string | undefined) => {
  if (typeof value === "undefined") {
    Reflect.deleteProperty(process.env, key);
  } else {
    Reflect.set(process.env, key, value);
  }
};

describe('preview token', () => {
  it('valid token passes', () => {
    const token = createPreviewToken('post1', 'user1', 60);
    expect(validatePreviewToken(token, 'post1', 'user1')).toBe('valid');
  });

  it('expired token detected', () => {
    const token = createPreviewToken('post1', 'user1', -10);
    expect(validatePreviewToken(token, 'post1', 'user1')).toBe('expired');
  });

  it('invalid token detected', () => {
    const token = createPreviewToken('post1', 'user1', 60);
    const tampered = token.replace(/.$/, token.endsWith('a') ? 'b' : 'a');
    expect(validatePreviewToken(tampered, 'post1', 'user1')).toBe('invalid');
  });

  it('missing secret returns invalid result in production', () => {
    const token = createPreviewToken('post1', 'user1', 60);
    const originalProcessSecret = process.env.PREVIEW_SECRET;
    const originalServerSecret = envModule.serverEnv.PREVIEW_SECRET;
    const originalNodeEnv = process.env.NODE_ENV;
    const originalServerNodeEnv = envModule.serverEnv.NODE_ENV;
    const originalPublicTestMode = process.env.NEXT_PUBLIC_TEST_MODE;
    const originalServerTestMode = envModule.serverEnv.TEST_MODE;
    const originalProcessAdminDisabled = process.env.ADMIN_AUTH_DISABLED;
    const originalServerAdminDisabled = envModule.serverEnv.ADMIN_AUTH_DISABLED;
    try {
      setProcessEnv("PREVIEW_SECRET", undefined);
      envModule.serverEnv.PREVIEW_SECRET = undefined;
      setProcessEnv("NODE_ENV", 'production');
      envModule.serverEnv.NODE_ENV = 'production';
      setProcessEnv("NEXT_PUBLIC_TEST_MODE", undefined);
      envModule.serverEnv.TEST_MODE = "false";
      setProcessEnv("ADMIN_AUTH_DISABLED", undefined);
      envModule.serverEnv.ADMIN_AUTH_DISABLED = undefined;
      expect(validatePreviewToken(token, 'post1', 'user1')).toBe('invalid');
    } finally {
      setProcessEnv("PREVIEW_SECRET", originalProcessSecret);
      envModule.serverEnv.PREVIEW_SECRET = originalServerSecret;
      setProcessEnv("NODE_ENV", originalNodeEnv);
      envModule.serverEnv.NODE_ENV = originalServerNodeEnv;
      setProcessEnv("NEXT_PUBLIC_TEST_MODE", originalPublicTestMode);
      envModule.serverEnv.TEST_MODE = originalServerTestMode;
      setProcessEnv("ADMIN_AUTH_DISABLED", originalProcessAdminDisabled);
      envModule.serverEnv.ADMIN_AUTH_DISABLED = originalServerAdminDisabled;
    }
  });

  it('falls back to default secret outside production when missing', () => {
    const originalProcessSecret = process.env.PREVIEW_SECRET;
    const originalServerSecret = envModule.serverEnv.PREVIEW_SECRET;
    const originalNodeEnv = process.env.NODE_ENV;
    const originalServerNodeEnv = envModule.serverEnv.NODE_ENV;
    try {
      setProcessEnv("PREVIEW_SECRET", undefined);
      envModule.serverEnv.PREVIEW_SECRET = undefined;
      setProcessEnv("NODE_ENV", 'test');
      envModule.serverEnv.NODE_ENV = 'test';
      const token = createPreviewToken('post1', 'user1', 60);
      expect(validatePreviewToken(token, 'post1', 'user1')).toBe('valid');
      expect(inspectPreviewToken(token).status).toBe('valid');
    } finally {
      setProcessEnv("PREVIEW_SECRET", originalProcessSecret);
      envModule.serverEnv.PREVIEW_SECRET = originalServerSecret;
      setProcessEnv("NODE_ENV", originalNodeEnv);
      envModule.serverEnv.NODE_ENV = originalServerNodeEnv;
    }
  });

  it('refuses to fall back to default secret in production even when NEXT_PUBLIC_TEST_MODE=1', () => {
    const originalProcessSecret = process.env.PREVIEW_SECRET;
    const originalServerSecret = envModule.serverEnv.PREVIEW_SECRET;
    const originalNodeEnv = process.env.NODE_ENV;
    const originalServerNodeEnv = envModule.serverEnv.NODE_ENV;
    const originalPublicTestMode = process.env.NEXT_PUBLIC_TEST_MODE;
    const originalServerTestMode = envModule.serverEnv.TEST_MODE;
    try {
      setProcessEnv("PREVIEW_SECRET", undefined);
      envModule.serverEnv.PREVIEW_SECRET = undefined;
      setProcessEnv("NODE_ENV", 'production');
      envModule.serverEnv.NODE_ENV = 'production';
      setProcessEnv("NEXT_PUBLIC_TEST_MODE", '1');
      envModule.serverEnv.TEST_MODE = 'true';
      expect(() => createPreviewToken('post1', 'user1', -10)).toThrow(
        'Missing PREVIEW_SECRET',
      );
    } finally {
      setProcessEnv("PREVIEW_SECRET", originalProcessSecret);
      envModule.serverEnv.PREVIEW_SECRET = originalServerSecret;
      setProcessEnv("NODE_ENV", originalNodeEnv);
      envModule.serverEnv.NODE_ENV = originalServerNodeEnv;
      setProcessEnv("NEXT_PUBLIC_TEST_MODE", originalPublicTestMode);
      envModule.serverEnv.TEST_MODE = originalServerTestMode;
    }
  });

  it('falls back to default secret in production when admin auth disabled', () => {
    const originalProcessSecret = process.env.PREVIEW_SECRET;
    const originalServerSecret = envModule.serverEnv.PREVIEW_SECRET;
    const originalNodeEnv = process.env.NODE_ENV;
    const originalServerNodeEnv = envModule.serverEnv.NODE_ENV;
    const originalProcessAdminDisabled = process.env.ADMIN_AUTH_DISABLED;
    const originalServerAdminDisabled = envModule.serverEnv.ADMIN_AUTH_DISABLED;
    try {
      setProcessEnv("PREVIEW_SECRET", undefined);
      envModule.serverEnv.PREVIEW_SECRET = undefined;
      setProcessEnv("NODE_ENV", 'production');
      envModule.serverEnv.NODE_ENV = 'production';
      setProcessEnv("ADMIN_AUTH_DISABLED", '1');
      envModule.serverEnv.ADMIN_AUTH_DISABLED = '1';
      const token = createPreviewToken('post1', 'user1', 60);
      expect(validatePreviewToken(token, 'post1', 'user1')).toBe('valid');
    } finally {
      setProcessEnv("PREVIEW_SECRET", originalProcessSecret);
      envModule.serverEnv.PREVIEW_SECRET = originalServerSecret;
      setProcessEnv("NODE_ENV", originalNodeEnv);
      envModule.serverEnv.NODE_ENV = originalServerNodeEnv;
      setProcessEnv("ADMIN_AUTH_DISABLED", originalProcessAdminDisabled);
      envModule.serverEnv.ADMIN_AUTH_DISABLED = originalServerAdminDisabled;
    }
  });

  it('inspect reports expired tokens', () => {
    const token = createPreviewToken('post1', 'user1', -10);
    expect(inspectPreviewToken(token).status).toBe('expired');
  });
});