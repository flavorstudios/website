import { renderHook, act } from "@testing-library/react";

describe("usePreviewNavigation", () => {
  const fetchMock = jest.fn();
  const openMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ token: "abc.def" }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;
    openMock.mockReset();
    openMock.mockReturnValue(null);
    window.open = openMock as unknown as typeof window.open;
  });

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("opens the preview page with the returned token", async () => {
    jest.doMock("@/hooks/use-toast", () => ({
      useToast: () => ({
        error: jest.fn(),
      }),
    }));
    const { usePreviewNavigation } = await import("../usePreviewNavigation");

    const { result } = renderHook(() => usePreviewNavigation());

    await act(async () => {
      await result.current.openPreview("post-123");
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/admin/preview-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: "post-123" }),
    });
    expect(openMock).toHaveBeenCalledWith(
      "/admin/preview/post-123?token=abc.def",
      "_blank",
      "noopener,noreferrer"
    );
  });
});