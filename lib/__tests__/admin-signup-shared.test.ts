import { signupFormSchema, getPasswordHints } from "@/lib/admin-signup-shared";

describe("admin signup validation", () => {
  it("rejects invalid email with accessible message", () => {
    const result = signupFormSchema.safeParse({
      name: "Ada Lovelace",
      email: "not-an-email",
      password: "Password123!",
      marketingOptIn: false,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email?.[0]).toBe(
        "Enter a valid email address"
      );
    }
  });

  it("flags weak passwords with targeted copy", () => {
    const result = signupFormSchema.safeParse({
      name: "Grace Hopper",
      email: "grace@example.com",
      password: "password",
      marketingOptIn: true,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.flatten().fieldErrors.password || [];
      expect(messages).toContain("Include at least one uppercase letter");
      expect(messages).toContain("Include at least one number");
      expect(messages).toContain("Include at least one symbol");
    }
  });

  it("reports remaining password hints", () => {
    expect(getPasswordHints("short")).toEqual([
      "12+ characters",
      "Upper & lowercase letters",
      "At least one number",
      "At least one symbol",
    ]);
  });

  it("returns no hints once requirements are met", () => {
    expect(getPasswordHints("StrongPassw0rd!")).toHaveLength(0);
  });
});