"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PASSWORD_RESET_NEUTRAL_MESSAGE,
  PASSWORD_RESET_RATE_LIMIT_MESSAGE,
} from "@/lib/password-reset-messages";
import { PageHeader } from "@/components/admin/page-header";

const EMAIL_ERROR_MESSAGE = "Enter a valid email address.";
const NETWORK_ERROR_MESSAGE = "Unable to process your request. Please try again.";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

type ForgotPasswordFormProps = {
  initialNotice?: string;
};

export default function ForgotPasswordForm({
  initialNotice,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(initialNotice ?? null);

  useEffect(() => {
    setNotice(initialNotice ?? null);
  }, [initialNotice]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!isValidEmail(trimmedEmail)) {
      setError(EMAIL_ERROR_MESSAGE);
      return;
    }

    setSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/admin/password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await response.json().catch(() => ({} as Record<string, unknown>));

      if (response.status === 429) {
        setError(PASSWORD_RESET_RATE_LIMIT_MESSAGE);
        return;
      }

      if (!response.ok) {
        const message =
          typeof data === "object" && data && "error" in data
            ? String(data.error)
            : NETWORK_ERROR_MESSAGE;
        setError(message);
        return;
      }

      const message =
        typeof data === "object" && data && "message" in data && typeof data.message === "string"
          ? data.message
          : PASSWORD_RESET_NEUTRAL_MESSAGE;

      setNotice(message);
      setEmail("");
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Password reset request failed", err);
      }
      setError(NETWORK_ERROR_MESSAGE);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f5] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm bg-white border border-slate-200 shadow-sm rounded-lg">
        <CardHeader className="p-6">
          <PageHeader
            title="Reset admin password"
            description="Enter your admin email to receive reset instructions."
            className="mb-0 text-center"
            containerClassName="flex-col items-center gap-2"
            headingClassName="text-2xl font-semibold text-slate-900"
            descriptionClassName="text-sm text-slate-600"
            level={2}
          />
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-3" aria-live="assertive">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {notice && (
                <Alert
                  className="bg-slate-50 border-slate-200 text-slate-700"
                  role="status"
                  aria-live="polite"
                >
                  <AlertDescription>{notice}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="forgot-password-email">Email</Label>
              <Input
                id="forgot-password-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => {
                  if (error) setError(null)
                  setEmail(event.target.value)
                }}
                aria-invalid={error ? true : undefined}
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              Continue
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 p-6 pt-0 text-center">
          <p className="text-sm text-slate-600">
            Remembered it?{" "}
            <Link href="/admin/login" className="font-medium text-blue-600 hover:underline">
              Back to login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}