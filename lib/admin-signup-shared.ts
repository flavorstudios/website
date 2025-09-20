import { z } from "zod";

export const signupFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be less than 80 characters"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .refine(
      (value) => /[A-Z]/.test(value),
      "Include at least one uppercase letter"
    )
    .refine(
      (value) => /[a-z]/.test(value),
      "Include at least one lowercase letter"
    )
    .refine((value) => /\d/.test(value), "Include at least one number")
    .refine(
      (value) => /[^A-Za-z0-9]/.test(value),
      "Include at least one symbol"
    ),
  marketingOptIn: z.boolean().optional(),
});

export type SignupFormInput = z.infer<typeof signupFormSchema>;

export const PASSWORD_HINTS = [
  "12+ characters",
  "Upper & lowercase letters",
  "At least one number",
  "At least one symbol",
];

export function getPasswordHints(password: string): string[] {
  const hints: string[] = [];
  if (password.length < 12) hints.push("12+ characters");
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
    hints.push("Upper & lowercase letters");
  }
  if (!/\d/.test(password)) hints.push("At least one number");
  if (!/[^A-Za-z0-9]/.test(password)) hints.push("At least one symbol");
  return hints;
}