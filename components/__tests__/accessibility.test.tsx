import React from "react";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

import EmailLoginForm from "@/app/admin/login/EmailLoginForm";

describe("Accessibility", () => {
  it("EmailLoginForm should have no axe violations", async () => {
    const Wrapper = () => {
      const [error, setError] = React.useState("");
      return <EmailLoginForm error={error} setError={setError} />;
    };

    const { container } = render(<Wrapper />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
