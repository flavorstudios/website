import { generateSitemapXML } from "@/lib/sitemap-utils"

describe("generateSitemapXML", () => {
  it("handles protocol-relative URLs without duplicating the site origin", () => {
    const xml = generateSitemapXML("https://flavorstudios.in", [
      {
        url: "//cdn.flavorstudios.in/assets/image.png",
        priority: "0.5",
        changefreq: "daily",
      },
    ])

    expect(xml).toContain("<loc>https://cdn.flavorstudios.in/assets/image.png</loc>")
  })

  it("normalizes absolute URLs that are prefixed with extra slashes", () => {
    const xml = generateSitemapXML("https://flavorstudios.in", [
      {
        url: "///https://external.example/article",
        priority: "0.2",
        changefreq: "monthly",
      },
    ])

    expect(xml).toContain("<loc>https://external.example/article</loc>")
  })
})