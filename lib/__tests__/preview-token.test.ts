/**
 * @jest-environment node
 */
process.env.PREVIEW_SECRET = 'test-secret';
const { serverEnv } = require('@/env/server');
serverEnv.PREVIEW_SECRET = 'test-secret';
const { createPreviewToken, validatePreviewToken } = require('../preview-token');

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
});