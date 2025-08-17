import React from "react";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

import EmailLoginForm from "@/app/admin/login/EmailLoginForm";

describe("Accessibility", () => {
  it("EmailLoginForm should have no axe violations", async () => {
    const { container } = render(<EmailLoginForm onCancel={() => {}} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
