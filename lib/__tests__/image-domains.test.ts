import { isAllowedImageUrl } from "@/lib/image-domains";

describe("isAllowedImageUrl", () => {
  it("allows HTTPS URLs for configured remote domains", () => {
    expect(
      isAllowedImageUrl("https://storage.googleapis.com/some/image.png"),
    ).toBe(true);
  });

  it("rejects HTTP URLs for configured remote domains", () => {
    expect(
      isAllowedImageUrl("http://storage.googleapis.com/some/image.png"),
    ).toBe(false);
  });

  it("allows same-origin HTTPS URLs", () => {
    expect(isAllowedImageUrl("https://flavorstudios.in/cover.jpg")).toBe(
      true,
    );
  });

  it("rejects same-host HTTP URLs", () => {
    expect(isAllowedImageUrl("http://flavorstudios.in/cover.jpg")).toBe(false);
  });
});