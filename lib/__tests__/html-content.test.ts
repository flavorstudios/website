import { ensureHtmlContent } from "@/lib/html-content"

const TIPTAP_DOCUMENT = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 2, textAlign: "center" },
      content: [
        {
          type: "text",
          marks: [
            {
              type: "underline",
            },
            {
              type: "link",
              attrs: {
                href: "https://example.com",
                target: "_blank",
                rel: "noopener noreferrer",
              },
            },
          ],
          text: "Visit Example",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Aligned content with media below.",
        },
      ],
    },
    {
      type: "image",
      attrs: {
        src: "https://example.com/image.jpg",
        alt: "Example image",
        title: "Example image",
      },
    },
  ],
} as const

describe("ensureHtmlContent", () => {
  it("generates HTML for documents using advanced TipTap marks", () => {
    const html = ensureHtmlContent(TIPTAP_DOCUMENT)

    expect(typeof html).toBe("string")
    expect(html.trim().length).toBeGreaterThan(0)
    expect(html).toContain("<u>")
    expect(html).toContain("text-align: center")
    expect(html).toContain("<a")
    expect(html).toContain("<img")
  })
})