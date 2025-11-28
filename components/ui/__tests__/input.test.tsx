import { render, screen } from "@testing-library/react"

import { Input } from "../input"

describe("Input", () => {
  it("applies a default date placeholder when none is provided", () => {
    render(<Input type="date" aria-label="Filter start date" />)

    expect(screen.getByLabelText("Filter start date")).toHaveAttribute(
      "placeholder",
      "mm/dd/yyyy",
    )
  })

  it("respects a custom placeholder", () => {
    render(<Input type="date" placeholder="custom" aria-label="Date" />)

    expect(screen.getByLabelText("Date")).toHaveAttribute(
      "placeholder",
      "custom",
    )
  })
})
