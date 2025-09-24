import { render, screen } from "@testing-library/react";
import BlogPostPreview from "../BlogPostPreview";

jest.mock("@/app/(marketing)/blog/[slug]/components/comment-section", () => () => null);
jest.mock("@/app/(marketing)/blog/[slug]/components/social-share", () => () => null);

const basePreviewPost = {
  id: "preview-id",
  title: "Preview Title",
  slug: "preview-title",
  content: "<p>Preview content</p>",
  excerpt: "Preview excerpt",
  status: "draft",
  category: "Updates",
  categories: ["Updates"],
  tags: [],
  featuredImage: undefined,
  seoTitle: "Preview SEO",
  seoDescription: "Preview description",
  author: { name: "Team" },
  publishedAt: "2024-01-01T00:00:00.000Z",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  views: 123,
  readTime: "5 min",
  commentCount: 0,
  shareCount: 0,
  schemaType: "Article",
  openGraphImage: undefined,
} as const;

describe("BlogPostPreview", () => {
  it("normalizes author objects for preview data", () => {
    render(<BlogPostPreview post={basePreviewPost as any} />);

    expect(screen.getByText("Team")).toBeInTheDocument();
  });
});