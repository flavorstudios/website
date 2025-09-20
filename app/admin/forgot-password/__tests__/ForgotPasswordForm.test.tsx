import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ForgotPasswordForm from "../ForgotPasswordForm";
import {
  PASSWORD_RESET_NEUTRAL_MESSAGE,
  PASSWORD_RESET_RATE_LIMIT_MESSAGE,
} from "@/lib/password-reset-messages";

const originalFetch = global.fetch;

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    global.fetch = jest.fn() as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.resetAllMocks();
    global.fetch = originalFetch;
  });

  it("validates email before submitting", async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText("Email"), "invalid");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(
      await screen.findByText("Enter a valid email address."),
    ).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("shows neutral confirmation after successful submission", async () => {
    const user = userEvent.setup();
    const json = jest.fn().mockResolvedValue({ message: PASSWORD_RESET_NEUTRAL_MESSAGE });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json,
    });

    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText("Email"), "admin@example.com");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => expect(json).toHaveBeenCalled());
    expect(
      await screen.findByText(PASSWORD_RESET_NEUTRAL_MESSAGE),
    ).toBeInTheDocument();
  });

  it("surfaces rate limit responses", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 429,
      json: jest.fn().mockResolvedValue({ error: PASSWORD_RESET_RATE_LIMIT_MESSAGE }),
    });

    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText("Email"), "admin@example.com");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(
      await screen.findByText(PASSWORD_RESET_RATE_LIMIT_MESSAGE),
    ).toBeInTheDocument();
  });
});