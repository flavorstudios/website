import { render, screen } from "@testing-library/react";

import LatestBlogsSection from "@/components/home/LatestBlogsSection";
import type { BlogPost } from "@/lib/types";

const basePost: BlogPost = {
  id: "test-post",
  title: "Placeholder Ready Post",
  slug: "placeholder-ready-post",
  content: "<p>Content</p>",
  excerpt: "Preview content",
  status: "published",
  category: "News",
  tags: ["updates"],
  featuredImage: "",
  featured: false,
  seoTitle: "Placeholder Ready Post",
  seoDescription: "Preview content",
  author: "Team",
  publishedAt: "2024-01-01T00:00:00.000Z",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  views: 42,
  readTime: "4 min",
  commentCount: 0,
  shareCount: 0,
  schemaType: "Article",
  openGraphImage: "",
};

describe("LatestBlogsSection", () => {
  it("falls back to the SVG placeholder when a post is missing a featured image", () => {
    render(<LatestBlogsSection posts={[basePost]} />);

    const image = screen.getByRole("img", { name: /Placeholder Ready Post/i });

    expect(image).toHaveAttribute("src", expect.stringContaining("/placeholder.svg"));
  });
});