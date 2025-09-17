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
    try {
      delete process.env.PREVIEW_SECRET;
      envModule.serverEnv.PREVIEW_SECRET = undefined;
      process.env.NODE_ENV = 'production';
      envModule.serverEnv.NODE_ENV = 'production';
      expect(validatePreviewToken(token, 'post1', 'user1')).toBe('invalid');
    } finally {
      process.env.PREVIEW_SECRET = originalProcessSecret;
      envModule.serverEnv.PREVIEW_SECRET = originalServerSecret;
      process.env.NODE_ENV = originalNodeEnv;
      envModule.serverEnv.NODE_ENV = originalServerNodeEnv;
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

  it('inspect reports expired tokens', () => {
    const token = createPreviewToken('post1', 'user1', -10);
    expect(inspectPreviewToken(token).status).toBe('expired');
  });
});