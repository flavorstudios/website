jest.mock("cheerio", () => {
  const load = jest.fn((html: string) => {
    const bodyApi = {
      remove: jest.fn(),
      each: jest.fn(),
      length: 1,
      html: jest.fn(() => html),
    };

    const defaultApi = {
      remove: jest.fn(),
      each: jest.fn(),
      length: 0,
      html: jest.fn(() => ""),
    };

    const factory = (selector: string) => {
      if (selector === "body") {
        return bodyApi;
      }

      if (selector === "*") {
        return {
          ...defaultApi,
          each: jest.fn(),
        };
      }

      return defaultApi;
    };

    factory.root = () => ({ html: () => html });

    return factory;
  });

  return { load };
});

jest.mock("@/app/(marketing)/blog/[slug]/components/comment-section", () => () => null);
jest.mock("@/app/(marketing)/blog/[slug]/components/social-share", () => () => null);

import { load as mockedLoad } from "cheerio";
import { render, screen } from "@testing-library/react";

import BlogRenderer from "../blog/BlogRenderer";
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not throw when content is non-string", () => {
    expect(() =>
      render(<BlogRenderer post={basePost} sanitizeHtml={sanitizeHtmlServer} />),
    ).not.toThrow();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Title");
    const load = jest.mocked(mockedLoad);
    expect(load).toHaveBeenCalledTimes(1);
    expect(load.mock.calls[0]?.[0]).toContain("<p>");
    expect(sanitizeHtmlServer(basePost.content)).toBe("");
  });

  it("renders article markup when coercing TipTap JSON content", () => {
    const { container } = render(
      <BlogRenderer post={basePost} sanitizeHtml={sanitizeHtmlServer} />,
    );

    const articleBody = container.querySelector(".prose");

    expect(articleBody?.innerHTML.trim().length).toBeGreaterThan(0);
    expect(screen.getByText("Tiptap")).toBeInTheDocument();
  });
});