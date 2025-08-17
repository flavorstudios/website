import React from "react";
import { render } from "@testing-library/react";
let axe: typeof import('jest-axe').axe | null = null;
try {
  const mod = require('jest-axe');
  axe = mod.axe;
  expect.extend(mod.toHaveNoViolations);
} catch {
  console.warn('jest-axe not installed, skipping accessibility tests');
}

import EmailLoginForm from "@/app/admin/login/EmailLoginForm";

(axe ? describe : describe.skip)("Accessibility", () => {
  it("EmailLoginForm should have no axe violations", async () => {
    const { container } = render(<EmailLoginForm onCancel={() => {}} />);
    const results = await axe!(container);
    expect(results).toHaveNoViolations();
  });
});