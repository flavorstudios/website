import { getCanonicalUrl } from "@/lib/seo/canonical"

describe("getCanonicalUrl", () => {
  it("preserves double slashes within query parameters", () => {
    expect(
      getCanonicalUrl("/?redirect=https://example.com/path//deep")
    ).toBe("https://flavorstudios.in/?redirect=https://example.com/path//deep")
  })

  it("normalizes duplicate slashes in the pathname only", () => {
    expect(getCanonicalUrl("watch//episode-01")).toBe(
      "https://flavorstudios.in/watch/episode-01"
    )
  })

  it("returns absolute URLs untouched", () => {
    const absolute = "https://cdn.example.com/assets/video.mp4"
    expect(getCanonicalUrl(absolute)).toBe(absolute)
  })
})