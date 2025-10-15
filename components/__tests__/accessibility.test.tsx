import React from "react";
import { render, waitFor } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

import EmailLoginForm from "@/app/admin/login/EmailLoginForm";

expect.extend(toHaveNoViolations);

describe("Accessibility", () => {
  it("EmailLoginForm should have no axe violations", async () => {
    const Wrapper = () => {
      const [error, setError] = React.useState("");
      return <EmailLoginForm error={error} setError={setError} />;
    };

    const { container } = render(<Wrapper />);

    await waitFor(async () => {
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
  });
});
