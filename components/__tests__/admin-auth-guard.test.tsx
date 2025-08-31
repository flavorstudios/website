import { render, screen, waitFor, act } from "@testing-library/react";
import AdminAuthGuard from "@/components/AdminAuthGuard";

describe("AdminAuthGuard", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it("shows a spinner while validating", async () => {
    let resolve: (value: unknown) => void = () => {};
    // fetch promise that never resolves until we call resolve
    global.fetch = jest.fn(
      () =>
        new Promise((res) => {
          resolve = res;
        })
    ) as unknown as typeof fetch;

    render(
      <AdminAuthGuard>
        <div>protected</div>
      </AdminAuthGuard>
    );

    expect(screen.getByTestId("loading")).toBeInTheDocument();

    // Resolve to avoid unhandled promise rejections
    await act(async () => {
      resolve({ ok: true } as Response);
    });
  });

  it("renders children when authenticated", async () => {
    global.fetch = jest
      .fn(() => Promise.resolve({ ok: true } as Response))
      .mockName("fetch");

    render(
      <AdminAuthGuard>
        <div>secret content</div>
      </AdminAuthGuard>
    );

    await waitFor(() =>
      expect(screen.getByText("secret content")).toBeInTheDocument()
    );
  });

  it("shows login prompt when unauthenticated", async () => {
    global.fetch = jest
      .fn(() => Promise.resolve({ ok: false } as Response))
      .mockName("fetch");

    render(
      <AdminAuthGuard>
        <div>hidden content</div>
      </AdminAuthGuard>
    );

    await waitFor(() =>
      expect(
        screen.getByText(/please log in to access the admin dashboard/i)
      ).toBeInTheDocument()
    );

    expect(screen.queryByText("hidden content")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /go to login/i })
    ).toHaveAttribute("href", "/admin/login");
  });
});