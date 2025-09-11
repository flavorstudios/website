import { isActive } from "../nav-utils"

describe("isActive", () => {
  it("returns true for exact root match", () => {
    expect(isActive("/", "/")).toBe(true)
  })

  it("returns true when pathname starts with href", () => {
    expect(isActive("/blog/post", "/blog")).toBe(true)
  })

  it("returns false for non-matching paths", () => {
    expect(isActive("/about", "/blog")).toBe(false)
  })

  it("returns false when href is undefined", () => {
    expect(isActive("/blog")).toBe(false)
  })
})