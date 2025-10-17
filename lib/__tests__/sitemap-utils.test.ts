import { fetchDynamicContent, generateSitemapXML } from "@/lib/sitemap-utils"

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

describe("fetchDynamicContent", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("requests videos from the public API endpoint", async () => {
    const baseUrl = "https://flavorstudios.in"

    const blogResponse = {
      ok: true,
      status: 200,
      json: async () => [
        {
          slug: "first-post",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          slug: "draft-post",
          status: "draft",
          updatedAt: "2024-01-03T00:00:00Z",
        },
      ],
    } as unknown as Response

    const videoResponse = {
      ok: true,
      status: 200,
      json: async () => [
        {
          slug: "pilot-episode",
          publishedAt: "2024-01-02T00:00:00Z",
        },
        {
          slug: "unreleased-clip",
          status: "draft",
          publishedAt: "2024-01-04T00:00:00Z",
        },
      ],
    } as unknown as Response

    const fetchSpy = jest
      .spyOn(globalThis as unknown as { fetch: typeof fetch }, "fetch")
      .mockImplementation((input: RequestInfo | URL) => {
        const url = typeof input === "string" ? input : input.toString()
        if (url.endsWith("/api/blogs")) {
          return Promise.resolve(blogResponse)
        }
        if (url.endsWith("/api/videos")) {
          return Promise.resolve(videoResponse)
        }
        return Promise.resolve({
          ok: false,
          status: 404,
          json: async () => ({}),
        } as unknown as Response)
      })

    const result = await fetchDynamicContent(baseUrl)

    expect(fetchSpy).toHaveBeenCalledWith(
      `${baseUrl}/api/videos`,
      expect.objectContaining({ cache: "no-store" }),
    )

    const urls = result.map((entry) => entry.url)
    expect(urls).toContain("/blog/first-post")
    expect(urls).toContain("/watch/pilot-episode")
    expect(urls).not.toContain("/blog/draft-post")
    expect(urls).not.toContain("/watch/unreleased-clip")
  })
})