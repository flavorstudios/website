import { normalizeSlug } from "../slugify";

describe("normalizeSlug", () => {
  it("strips diacritics", () => {
    expect(normalizeSlug("Café Été")).toBe("cafe-ete");
  });

  it("collapses repeated hyphens", () => {
    expect(normalizeSlug("hello---world__test")).toBe("hello-world-test");
  });
  
it("returns an empty string for nullish values", () => {
    expect(normalizeSlug(null)).toBe("");
    expect(normalizeSlug(undefined)).toBe("");
  });

  it("stringifies non-string values", () => {
    expect(normalizeSlug(123)).toBe("123");
    expect(normalizeSlug({ toString: () => "custom" })).toBe("custom");
  });
});