import { safeDateLabel } from "../safe-date";

describe("safeDateLabel", () => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  it("formats ISO strings", () => {
    expect(safeDateLabel("2024-05-10T12:34:56.000Z", options)).toBe(
      "May 10, 2024",
    );
  });

  it("formats Date instances", () => {
    const date = new Date(Date.UTC(2024, 4, 10, 12, 34, 56));
    expect(safeDateLabel(date, options)).toBe("May 10, 2024");
  });

  it("formats timestamps", () => {
    const timestamp = Date.UTC(2024, 4, 10, 12, 34, 56);
    expect(safeDateLabel(timestamp, options)).toBe("May 10, 2024");
  });

  it("returns null for invalid input", () => {
    expect(safeDateLabel("not-a-date", options)).toBeNull();
  });
});