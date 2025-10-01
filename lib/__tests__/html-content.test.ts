jest.mock("@/lib/log", () => ({
  logError: jest.fn(),
  logBreadcrumb: jest.fn(),
}))

jest.mock("@tiptap/core", () => {
  const actual = jest.requireActual("@tiptap/core")
  return {
    ...actual,
    generateHTML: jest.fn((...args) => actual.generateHTML(...args)),
  }
})

import * as tiptapCore from "@tiptap/core"

import { ensureHtmlContent } from "@/lib/html-content"
import { logBreadcrumb, logError } from "@/lib/log"

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

const mockedLogError = logError as jest.Mock
const mockedLogBreadcrumb = logBreadcrumb as jest.Mock
const mockedGenerateHTML = tiptapCore.generateHTML as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
})

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

  it("returns the original JSON string and logs when the payload is not TipTap JSON", () => {
    const payload = JSON.stringify({ title: "Not TipTap" })

    const html = ensureHtmlContent(payload)

    expect(html).toBe(payload)
    expect(html.length).toBeGreaterThan(0)
    expect(mockedLogBreadcrumb).toHaveBeenCalledWith("html-content:fallback", {
      preview: payload,
      reason: "string-json-not-tiptap",
    })
  })

  it("falls back to string output and logs when generateHTML throws", () => {
    const error = new Error("generate failure")
    mockedGenerateHTML.mockImplementationOnce(() => {
      throw error
    })

    const html = ensureHtmlContent(TIPTAP_DOCUMENT)

    expect(html.length).toBeGreaterThan(0)
    expect(mockedLogError).toHaveBeenCalledWith(
      "html-content:generate-html",
      error,
      { type: "doc" },
    )
    expect(mockedLogBreadcrumb).toHaveBeenCalledWith("html-content:fallback", {
      reason: "object-json-conversion-failed",
    })
  })
})