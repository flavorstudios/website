"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Check } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  signupFormSchema,
  PASSWORD_HINTS,
  getPasswordHints,
  type SignupFormInput,
} from "@/lib/admin-signup-shared";
import { clientEnv } from "@/env.client";
import { useAdminAuth } from "@/components/AdminAuthProvider";

type FieldErrors = Partial<Record<"name" | "email" | "password", string>>;

const emptyForm: SignupFormInput = {
  name: "",
  email: "",
  password: "",
  marketingOptIn: false,
};

export default function SignupForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<SignupFormInput>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [pending, setPending] = useState(false);

  const passwordFeedback = useMemo(
    () => new Set(getPasswordHints(formData.password)),
    [formData.password]
  );

  const { setTestEmailVerified } = useAdminAuth();
  const testMode = clientEnv.TEST_MODE === "true";
  const requiresVerification =
    clientEnv.NEXT_PUBLIC_REQUIRE_ADMIN_EMAIL_VERIFICATION === "true";

  const handleChange = <K extends keyof SignupFormInput>(
    key: K,
    value: SignupFormInput[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    setFormError("");
    setSuccessMessage("");
  };

  const validate = () => {
    const result = signupFormSchema.safeParse(formData);
    if (result.success) {
      setFieldErrors({});
      return true;
    }
    const { fieldErrors: errors } = result.error.flatten();
    const nextErrors: FieldErrors = {};
    if (errors.name?.length) nextErrors.name = errors.name[0]!;
    if (errors.email?.length) nextErrors.email = errors.email[0]!;
    if (errors.password?.length) nextErrors.password = errors.password[0]!;
    setFieldErrors(nextErrors);
    return false;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");

    if (!validate()) {
      return;
    }

    setPending(true);
    (async () => {
      try {
        const response = await fetch("/api/admin/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData),
        });

        const data = (await response.json().catch(() => null)) as
          | { error?: string; redirectTo?: string; requiresVerification?: boolean }
          | null;

        if (!response.ok) {
          const message = data?.error || "Unable to create account.";
          setFormError(message);
          setPending(false);
          return;
        }

        const redirect = data?.redirectTo || "/admin/dashboard";
        setSuccessMessage(
          data?.requiresVerification
            ? "Check your inbox to verify your email."
            : "Account created! Redirecting…"
        );

        if (testMode) {
          setTestEmailVerified(data?.requiresVerification ? false : true);
          if (typeof window !== "undefined") {
            window.location.assign(redirect);
            return;
          }
        }
        
        router.push(redirect);
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Signup request failed", error);
        }
        setFormError("Unable to create account.");
      } finally {
        setPending(false);
      }
    })();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div aria-live="assertive" className="min-h-[1.5rem] text-sm">
        {formError && (
          <p
            id="signup-error"
            role="alert"
            className="text-red-600"
            data-testid="signup-error"
          >
            {formError}
          </p>
        )}
        {successMessage && (
          <p
            className="text-emerald-600"
            role="status"
            data-testid="verify-status"
          >
            {successMessage}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-name">Full name</Label>
        <Input
          id="signup-name"
          autoComplete="name"
          value={formData.name}
          onChange={(event) => handleChange("name", event.target.value)}
          aria-describedby={fieldErrors.name ? "signup-name-error" : undefined}
          required
        />
        {fieldErrors.name && (
          <p
            id="signup-name-error"
            className="text-sm text-red-600"
            role="alert"
          >
            {fieldErrors.name}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          value={formData.email}
          onChange={(event) => handleChange("email", event.target.value)}
          aria-describedby={fieldErrors.email ? "signup-email-error" : undefined}
          required
        />
        {fieldErrors.email && (
          <p
            id="signup-email-error"
            className="text-sm text-red-600"
            role="alert"
          >
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="signup-password">Password</Label>
          <Input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={(event) => handleChange("password", event.target.value)}
            aria-describedby={
              fieldErrors.password ? "signup-password-error" : "signup-password-hints"
            }
            required
          />
          {fieldErrors.password && (
            <p
              id="signup-password-error"
              className="text-sm text-red-600"
              role="alert"
            >
              {fieldErrors.password}
            </p>
          )}
        </div>
        <div
          id="signup-password-hints"
          className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600"
        >
          <p className="font-medium">Password must include:</p>
          <ul className="mt-2 space-y-1">
            {PASSWORD_HINTS.map((hint) => {
              const satisfied = !passwordFeedback.has(hint);
              return (
                <li
                  key={hint}
                  className={`flex items-center gap-2 ${
                    satisfied ? "text-emerald-600" : "text-slate-600"
                  }`}
                >
                  <Check
                    className={`h-3.5 w-3.5 ${
                      satisfied ? "opacity-100" : "opacity-40"
                    }`}
                    aria-hidden="true"
                  />
                  <span>{hint}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="flex items-start gap-2">
        <Checkbox
          id="signup-marketing"
          checked={!!formData.marketingOptIn}
          onCheckedChange={(checked) =>
            handleChange("marketingOptIn", Boolean(checked))
          }
        />
        <Label
          htmlFor="signup-marketing"
          className="text-sm font-normal leading-snug text-muted-foreground"
        >
          Keep me up to date with product news and security updates.
        </Label>
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
        Create admin account
      </Button>

      <p className="text-sm text-muted-foreground">
        Already have access? {" "}
        <Link href="/admin/login" className="text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
        .
      </p>

      {requiresVerification && (
        <p className="text-xs text-muted-foreground">
          Email verification is required before you can use privileged admin actions.
        </p>
      )}
    </form>
  );
}