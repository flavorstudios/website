import { isActive } from "../nav-utils"

describe("isActive", () => {
  it("returns true for exact root match", () => {
    expect(isActive("/", "/")).toBe(true)
  })

  it("returns true when pathname starts with href", () => {
    expect(isActive("/blog/post", "/blog")).toBe(true)
  })

  it("returns true for trailing slash", () => {
    expect(isActive("/blog/", "/blog")).toBe(true)
  })

  it("returns false when pathname only shares a prefix", () => {
    expect(isActive("/bloggers", "/blog")).toBe(false)
  })

  it("returns false when pathname only shares a prefix without leading slash", () => {
    expect(isActive("dashboard/administer", "dashboard/admin")).toBe(false)
  })

  it("returns false for non-matching paths", () => {
    expect(isActive("/about", "/blog")).toBe(false)
  })

  it("returns false when href is undefined", () => {
    expect(isActive("/blog")).toBe(false)
  })

  it("ignores query strings and hashes when determining activity", () => {
    expect(isActive("/blog", "/blog?page=2")).toBe(true)
    expect(isActive("/blog/article", "/blog#top")).toBe(true)
    expect(isActive("/blog", "/blog?category=dev#section")).toBe(true)
  })
})