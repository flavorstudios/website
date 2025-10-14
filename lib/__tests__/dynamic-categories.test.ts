import { getBlogCategories } from "../dynamic-categories"

jest.mock("@/content-data/categories.json", () => ({
  CATEGORIES: {
    blog: [
      {
        title: "Missing Slug",
        slug: "",
        isActive: true,
        order: 2,
        postCount: 3,
      },
      {
        title: "Existing Slug",
        slug: "kept-slug",
        isActive: true,
        order: 1,
        postCount: 1,
      },
      {
        title: "Inactive",
        slug: "inactive",
        isActive: false,
        order: 3,
        postCount: 5,
      },
    ],
    watch: [],
  },
}))

describe("getBlogCategories", () => {
  it("derives a slug when one is missing", async () => {
    const categories = await getBlogCategories()

    expect(categories).toHaveLength(2)
    expect(categories[0]).toMatchObject({
      name: "Existing Slug",
      slug: "kept-slug",
    })
    expect(categories[1]).toMatchObject({
      name: "Missing Slug",
      slug: "missing-slug",
    })
  })
})