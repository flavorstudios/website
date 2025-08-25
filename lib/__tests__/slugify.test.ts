import { slugify } from '../slugify';

describe('slugify', () => {
  it('converts text to URL-friendly slugs', () => {
    expect(slugify('Hello World!')).toBe('hello-world');
  });

  it('strips diacritics', () => {
    expect(slugify('Café Été')).toBe('cafe-ete');
  });
});