jest.mock("cheerio", () => {
  const load = jest.fn(() => {
    const factory = (selector: string) => {
      const api = {
        remove: jest.fn(),
        each: jest.fn(),
        length: selector === "body" ? 1 : 0,
        html: jest.fn(() => ""),
      };
      return api;
    };

    factory.root = () => ({ html: () => "" });

    return factory;
  });

  return { load };
});

import { render, screen } from "@testing-library/react";

import BlogPostRenderer from "../BlogPostRenderer";
import { sanitizeHtmlServer } from "@/lib/sanitize/server";

describe("BlogPostRenderer", () => {
  const basePost: any = {
    id: "1",
    title: "Title",
    slug: "slug",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Tiptap" }],
        },
      ],
    },
    excerpt: "excerpt",
    status: "published",
    category: "cat",
    categories: ["cat"],
    tags: ["tag"],
    featuredImage: "/test.jpg",
    seoTitle: "seo",
    seoDescription: "desc",
    author: "Author",
    publishedAt: "2024-01-01",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
    views: 0,
    readTime: "1 min",
  };

  it("does not throw when content is non-string", () => {
    expect(() => render(<BlogPostRenderer post={basePost} />)).not.toThrow();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Title");
    const { load } = require("cheerio") as { load: jest.Mock };
    expect(load).not.toHaveBeenCalled();
    expect(sanitizeHtmlServer(basePost.content)).toBe("");
  });
});