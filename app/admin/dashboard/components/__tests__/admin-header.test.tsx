import { render } from "@testing-library/react";
import { AdminHeader } from "../admin-header";

describe("AdminHeader", () => {
  beforeEach(() => {
    // stub fetch used for avatar loading
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ settings: { profile: { avatar: "" } } })
      })
    ) as unknown as typeof fetch;
  });

  it("matches snapshot", () => {
    const { container } = render(
      <AdminHeader
        onLogout={() => {}}
        sidebarOpen={false}
        setSidebarOpen={() => {}}
      />
    );
    expect(container).toMatchSnapshot();
  });
});