/**
 * @jest-environment node
 */
process.env.PREVIEW_SECRET = 'test-secret';
/* eslint-disable @typescript-eslint/no-require-imports */
const envModule = require("@/env/server");
envModule.serverEnv.PREVIEW_SECRET = "test-secret";
const {
  createPreviewToken,
  validatePreviewToken,
  inspectPreviewToken,
} = require("../preview-token");
/* eslint-enable @typescript-eslint/no-require-imports */

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
    const originalProcessTestMode = process.env.TEST_MODE;
    const originalServerTestMode = envModule.serverEnv.TEST_MODE;
    const originalProcessAdminDisabled = process.env.ADMIN_AUTH_DISABLED;
    const originalServerAdminDisabled = envModule.serverEnv.ADMIN_AUTH_DISABLED;
    try {
      delete process.env.PREVIEW_SECRET;
      envModule.serverEnv.PREVIEW_SECRET = undefined;
      process.env.NODE_ENV = 'production';
      envModule.serverEnv.NODE_ENV = 'production';
      delete process.env.TEST_MODE;
      envModule.serverEnv.TEST_MODE = undefined;
      delete process.env.ADMIN_AUTH_DISABLED;
      envModule.serverEnv.ADMIN_AUTH_DISABLED = undefined;
      expect(validatePreviewToken(token, 'post1', 'user1')).toBe('invalid');
    } finally {
      process.env.PREVIEW_SECRET = originalProcessSecret;
      envModule.serverEnv.PREVIEW_SECRET = originalServerSecret;
      process.env.NODE_ENV = originalNodeEnv;
      envModule.serverEnv.NODE_ENV = originalServerNodeEnv;
      process.env.TEST_MODE = originalProcessTestMode;
      envModule.serverEnv.TEST_MODE = originalServerTestMode;
      process.env.ADMIN_AUTH_DISABLED = originalProcessAdminDisabled;
      envModule.serverEnv.ADMIN_AUTH_DISABLED = originalServerAdminDisabled;
    }
  });

  it('falls back to default secret outside production when missing', () => {
    const originalProcessSecret = process.env.PREVIEW_SECRET;
    const originalServerSecret = envModule.serverEnv.PREVIEW_SECRET;
    const originalNodeEnv = process.env.NODE_ENV;
    const originalServerNodeEnv = envModule.serverEnv.NODE_ENV;
    try {
      delete process.env.PREVIEW_SECRET;
      envModule.serverEnv.PREVIEW_SECRET = undefined;
      process.env.NODE_ENV = 'test';
      envModule.serverEnv.NODE_ENV = 'test';
      const token = createPreviewToken('post1', 'user1', 60);
      expect(validatePreviewToken(token, 'post1', 'user1')).toBe('valid');
      expect(inspectPreviewToken(token).status).toBe('valid');
    } finally {
      process.env.PREVIEW_SECRET = originalProcessSecret;
      envModule.serverEnv.PREVIEW_SECRET = originalServerSecret;
      process.env.NODE_ENV = originalNodeEnv;
      envModule.serverEnv.NODE_ENV = originalServerNodeEnv;
    }
  });

  it('falls back to default secret in production when test mode enabled', () => {
    const originalProcessSecret = process.env.PREVIEW_SECRET;
    const originalServerSecret = envModule.serverEnv.PREVIEW_SECRET;
    const originalNodeEnv = process.env.NODE_ENV;
    const originalServerNodeEnv = envModule.serverEnv.NODE_ENV;
    const originalProcessTestMode = process.env.TEST_MODE;
    const originalServerTestMode = envModule.serverEnv.TEST_MODE;
    try {
      delete process.env.PREVIEW_SECRET;
      envModule.serverEnv.PREVIEW_SECRET = undefined;
      process.env.NODE_ENV = 'production';
      envModule.serverEnv.NODE_ENV = 'production';
      process.env.TEST_MODE = 'true';
      envModule.serverEnv.TEST_MODE = 'true';
      const token = createPreviewToken('post1', 'user1', -10);
      const inspection = inspectPreviewToken(token);
      expect(inspection.status).toBe('expired');
    } finally {
      process.env.PREVIEW_SECRET = originalProcessSecret;
      envModule.serverEnv.PREVIEW_SECRET = originalServerSecret;
      process.env.NODE_ENV = originalNodeEnv;
      envModule.serverEnv.NODE_ENV = originalServerNodeEnv;
      process.env.TEST_MODE = originalProcessTestMode;
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
      delete process.env.PREVIEW_SECRET;
      envModule.serverEnv.PREVIEW_SECRET = undefined;
      process.env.NODE_ENV = 'production';
      envModule.serverEnv.NODE_ENV = 'production';
      process.env.ADMIN_AUTH_DISABLED = '1';
      envModule.serverEnv.ADMIN_AUTH_DISABLED = '1';
      const token = createPreviewToken('post1', 'user1', 60);
      expect(validatePreviewToken(token, 'post1', 'user1')).toBe('valid');
    } finally {
      process.env.PREVIEW_SECRET = originalProcessSecret;
      envModule.serverEnv.PREVIEW_SECRET = originalServerSecret;
      process.env.NODE_ENV = originalNodeEnv;
      envModule.serverEnv.NODE_ENV = originalServerNodeEnv;
      process.env.ADMIN_AUTH_DISABLED = originalProcessAdminDisabled;
      envModule.serverEnv.ADMIN_AUTH_DISABLED = originalServerAdminDisabled;
    }
  });

  it('inspect reports expired tokens', () => {
    const token = createPreviewToken('post1', 'user1', -10);
    expect(inspectPreviewToken(token).status).toBe('expired');
  });
});