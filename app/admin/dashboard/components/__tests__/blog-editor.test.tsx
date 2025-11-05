import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BlogEditor } from "../blog-editor";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  usePathname: () => "/admin/dashboard/blog",
}));

const toastMock = {
  success: jest.fn(),
  error: jest.fn(),
  warning: jest.fn(),
};

jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: toastMock,
    success: toastMock.success,
    error: toastMock.error,
    warning: toastMock.warning,
  }),
}));

jest.mock("@/hooks/useAutosave", () => ({
  useAutosave: jest.fn(() => ({ status: "idle", savedAt: null })),
}));

const useAutosaveMock = jest.requireMock("@/hooks/useAutosave").useAutosave as jest.Mock;

jest.mock("../BlogPostPreview", () => {
  const MockBlogPostPreview = () => <div data-testid="blog-post-preview" />;
  MockBlogPostPreview.displayName = "MockBlogPostPreview";
  return MockBlogPostPreview;
});

jest.mock("../media/MediaPickerDialog", () => () => null);

jest.mock("../rich-text-editor", () => ({
  RichTextEditor: ({
    value,
    onChange,
    ariaLabelledBy,
    ariaLabel,
  }: {
    value: string;
    onChange: (val: string) => void;
    ariaLabelledBy?: string;
    ariaLabel?: string;
  }) => (
    <textarea
      data-testid="rich-text-editor"
      aria-labelledby={ariaLabelledBy}
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...rest }: { children: ReactNode }) => <div {...rest}>{children}</div>,
  },
}));

describe("BlogEditor publish flow", () => {
  let consoleWarnSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterAll(() => {
    consoleWarnSpy.mockRestore();
  });

  beforeEach(() => {
    pushMock.mockClear();
    toastMock.success.mockClear();
    toastMock.error.mockClear();
    toastMock.warning.mockClear();
    useAutosaveMock.mockClear();
    global.fetch = jest.fn((input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();

      if (url.includes("/api/admin/categories")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ categories: [] }),
        }) as unknown as Promise<Response>;
      }

      if (url.includes("/api/admin/blogs")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ id: "post-123" }),
        }) as unknown as Promise<Response>;
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      }) as unknown as Promise<Response>;
    }) as unknown as typeof fetch;
  });

  it("redirects to the published blog slug after publishing", async () => {
    const user = userEvent.setup();

    render(
      <TooltipProvider>
        <BlogEditor
          initialPost={{
            title: "Test Publish Title",
            content: "<p>Test content</p>",
          }}
        />
      </TooltipProvider>
    );

    const publishButtons = await screen.findAllByRole("button", { name: /publish/i });
    const publishButton = publishButtons.at(0);
    expect(publishButton).toBeDefined();
    if (!publishButton) {
      throw new Error("publish button not found");
    }
    await user.click(publishButton);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/blog/test-publish-title");
    });
  });
});