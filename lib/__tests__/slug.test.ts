import { normalizeSlug } from '../slugify';

describe('normalizeSlug', () => {
  it('strips diacritics', () => {
    expect(normalizeSlug('Café Été')).toBe('cafe-ete');
  });

  it('collapses repeated hyphens', () => {
    expect(normalizeSlug('hello---world__test')).toBe('hello-world-test');
  });
});