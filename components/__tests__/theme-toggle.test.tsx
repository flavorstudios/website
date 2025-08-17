import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@/components/theme-provider";
import ThemeToggle from "@/components/theme-toggle";

// Provide matchMedia mock for next-themes default "system" behaviour
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

afterEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
});

describe("ThemeToggle", () => {
  const renderToggle = () =>
    render(
      <ThemeProvider attribute="class" defaultTheme="system">
        <ThemeToggle />
      </ThemeProvider>,
    );

  it("toggles dark mode, persists theme, and updates html class", async () => {
    const user = userEvent.setup();

    const { unmount } = renderToggle();
    const button = screen.getByRole("button", { name: /toggle theme/i });

    await user.click(button);

    await waitFor(() => {
      expect(localStorage.getItem("theme")).toBe("dark");
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    unmount();
    document.documentElement.classList.remove("dark");

    renderToggle();

    await waitFor(() => {
      expect(localStorage.getItem("theme")).toBe("dark");
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    const buttonAgain = screen.getByRole("button", { name: /toggle theme/i });
    await user.click(buttonAgain);

    await waitFor(() => {
      expect(localStorage.getItem("theme")).toBe("light");
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });
  });
});
