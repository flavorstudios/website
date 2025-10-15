import { act, render, screen, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";

import EmailLoginForm from "@/app/admin/login/EmailLoginForm";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const mockFetchMfaRequirement = (mfaRequired: boolean) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ mfaRequired }),
  } as unknown as Response);
};

const renderEmailLoginForm = async (mfaRequired: boolean) => {
  mockFetchMfaRequirement(mfaRequired);

  let renderResult: ReturnType<typeof render> | undefined;
  await act(async () => {
    renderResult = render(
      <SWRConfig
        value={{
          provider: () => new Map(),
          dedupingInterval: 0,
          revalidateOnFocus: false,
          shouldRetryOnError: false,
        }}
      >
        <EmailLoginForm error="" setError={jest.fn()} />
      </SWRConfig>
    );
  });

  return renderResult!;
};

afterEach(() => {
  jest.restoreAllMocks();
});

describe("EmailLoginForm", () => {
  it("does not render verification code toggle when MFA is not required", async () => {
    await renderEmailLoginForm(false);

    await waitFor(() => {
        expect(
            screen.queryByRole("button", { name: /verification code/i })
        ).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/verification code/i)).not.toBeInTheDocument();
    });
  });

  it("renders verification code controls when MFA is required", async () => {
    await renderEmailLoginForm(true);

    await screen.findByLabelText(/verification code/i);

    expect(screen.getByRole("button", { name: /verification code/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /having trouble\?/i })).toBeInTheDocument();
  });
});
