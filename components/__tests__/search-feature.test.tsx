import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import type { PublicBlogSummary } from "@/lib/types"

type SearchFeatureComponent = typeof import("@/components/ui/search-feature") extends { SearchFeature: infer T }
  ? T
  : never

const originalApiBase = process.env.NEXT_PUBLIC_API_BASE_URL
if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
  process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com"
}

describe("SearchFeature", () => {
  const originalFetch = global.fetch
  const originalWarn = console.warn
  let SearchFeature: SearchFeatureComponent

  beforeAll(() => {
    jest.spyOn(console, "warn").mockImplementation((...args: Parameters<typeof console.warn>) => {
      if (typeof args[0] === "string" && args[0].includes("Missing optional client env var")) {
        return
      }
      originalWarn(...args)
    })
    return import("@/components/ui/search-feature").then((mod) => {
      SearchFeature = mod.SearchFeature
    })
  })

  afterEach(() => {
    global.fetch = originalFetch
    jest.clearAllMocks()
  })

  afterAll(() => {
    console.warn = originalWarn
    process.env.NEXT_PUBLIC_API_BASE_URL = originalApiBase
  })

  it("shows blog results returned from the API", async () => {
    const blogResult: PublicBlogSummary = {
      id: "blog-1",
      title: "How We Build Developer Velocity Without Burning Out",
      slug: "build-developer-velocity-without-burnout",
      excerpt: "Practical rituals and tooling that help our engineers move quickly.",
      featuredImage: "/placeholder.png",
      category: "Engineering",
      categories: ["Engineering", "Culture"],
      tags: ["developer-experience"],
      publishedAt: "2024-01-15T09:00:00.000Z",
      readTime: "6 min",
      views: 328,
      seoTitle: "Build Developer Velocity Without Burnout",
      seoDescription:
        "Discover how our engineering team balances rapid delivery with sustainable practices across tooling, rituals, and culture.",
      featured: true,
      commentCount: 4,
      shareCount: 12,
      author: "Platform Team",
    }

    const fetchMock = jest.fn((input: RequestInfo | URL) => {
      if (typeof input === "string" && input.includes("/posts")) {
        return Promise.resolve(
          new Response(JSON.stringify([blogResult]), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        )
      }

      if (typeof input === "string" && input.includes("/videos")) {
        return Promise.resolve(
          new Response(JSON.stringify([]), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        )
      }

      return Promise.reject(new Error("Unexpected request"))
    })

    global.fetch = fetchMock as unknown as typeof global.fetch

    render(<SearchFeature />)

    const user = userEvent.setup()

    await user.click(screen.getByRole("button", { name: /search/i }))

    const input = await screen.findByPlaceholderText(
      /Search blog posts, videos, or support content…/i,
    )

    await user.type(input, "velocity")

    const blogLink = await screen.findByRole("link", {
      name: /How We Build Developer Velocity Without Burning Out/i,
    })

    expect(blogLink).toBeInTheDocument()
    expect(blogLink).toHaveAttribute(
      "href",
      "/blog/build-developer-velocity-without-burnout",
    )

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/posts"))
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/videos"))
  })
})