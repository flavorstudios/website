jest.mock("@/env/server", () => ({
  serverEnv: {
    NEXT_PUBLIC_BASE_URL: undefined,
    BASE_URL: undefined,
  },
}))

jest.mock("@/lib/constants", () => ({
  SITE_URL: "https://example.com",
}))

describe("lib/blog", () => {
  const originalNodeEnv = process.env.NODE_ENV

  beforeEach(() => {
    process.env.NODE_ENV = "test"
  })

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv
    jest.resetModules()
    jest.restoreAllMocks()
  })

  it("builds absolute URLs when no base URL env is set", async () => {
    const fetchMock = jest
      .spyOn(globalThis, "fetch" as const)
      .mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ id: "post", slug: "post" }),
      } as unknown as Response)

    const { SITE_URL } = await import("@/lib/constants")
    const { getBlogPost } = await import("@/lib/blog")

    await getBlogPost("post")

    expect(fetchMock).toHaveBeenCalledWith(
      `${SITE_URL}/api/blogs/post`,
      expect.objectContaining({ next: { revalidate: 300 } }),
    )
  })
})