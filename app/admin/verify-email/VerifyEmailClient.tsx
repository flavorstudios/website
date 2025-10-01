"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getFirebaseAuth } from "@/lib/firebase";
import { clientEnv } from "@/env.client";
import { useAdminAuth } from "@/components/AdminAuthProvider";

type StatusMessage = {
  tone: "neutral" | "success" | "error";
  message: string;
};

export default function VerifyEmailClient() {
  const router = useRouter();
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { testEmailVerified, setTestEmailVerified } = useAdminAuth();

  const requireVerification =
    clientEnv.NEXT_PUBLIC_REQUIRE_ADMIN_EMAIL_VERIFICATION === "true";
  const testMode = clientEnv.TEST_MODE === "true";

  const waitForNextFrame = useCallback(
    () =>
      new Promise<void>((resolve) => {
        if (typeof window === "undefined") {
          resolve();
          return;
        }
        if (typeof window.requestAnimationFrame === "function") {
          window.requestAnimationFrame(() => resolve());
        } else {
          window.setTimeout(() => resolve(), 0);
        }
      }),
    []
  );

  const startRedirect = useCallback(
    (
      path: string,
      options?: {
        delayMs?: number;
        onBeforeNavigate?: () => void;
      }
    ) => {
      void (async () => {
        await waitForNextFrame();
        options?.onBeforeNavigate?.();
        if (options?.delayMs && options.delayMs > 0) {
          await new Promise<void>((resolve) => {
            const schedule = () => resolve();
            if (typeof window !== "undefined") {
              window.setTimeout(schedule, options.delayMs);
            } else {
              setTimeout(schedule, options.delayMs);
            }
          });
        }
        router.replace(path);
      })();
    },
    [router, waitForNextFrame]
  );

  const refreshUser = useCallback(async () => {
    let shouldResetLoading = true;

    const scheduleRedirect = (path: string) => {
      shouldResetLoading = false;
      startRedirect(path);
    };

    if (testMode) {
      const verified = testEmailVerified ?? false;
      if (verified) {
        setStatus({
          tone: "success",
          message: "Email verified! Redirecting to the dashboard…",
        });
        scheduleRedirect("/admin/dashboard");
      } else {
        setStatus({
          tone: "neutral",
          message:
            "Test mode: set admin-test-email-verified to true in localStorage or click “I have verified” once ready.",
        });
      }
      if (shouldResetLoading) {
        setLoading(false);
      }
      return;
    }

    try {
      const auth = getFirebaseAuth();
      const user = auth.currentUser;
      if (!user) {
        scheduleRedirect("/admin/login");
        return;
      }
      await user.reload();
      if (user.emailVerified || !requireVerification) {
        setStatus({
          tone: "success",
          message: "Email verified! Redirecting to the dashboard…",
        });
        scheduleRedirect("/admin/dashboard");
        return;
      }
      setStatus({
        tone: "neutral",
        message: "We sent a verification link to your inbox. Once verified, click “I have verified” to continue.",
      });
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("verify-email: refresh error", error);
      }
      setStatus({
        tone: "error",
        message: "We couldn't verify your status. Please try again shortly.",
      });
    } finally {
      if (shouldResetLoading) {
        setLoading(false);
      }
    }
  }, [
    requireVerification,
    startRedirect,
    testMode,
    testEmailVerified,
  ]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const handleResend = async () => {
    if (testMode) {
      setStatus({
        tone: "neutral",
        message:
          "Test mode: pretend email sent. Toggle admin-test-email-verified in localStorage to simulate verification.",
      });
      return;
    }
    let shouldResetSending = true;
    try {
      setSending(true);
      const auth = getFirebaseAuth();
      const user = auth.currentUser;
      if (!user) {
        shouldResetSending = false;
        startRedirect("/admin/login");
        return;
      }
      await user.reload();
      if (user.emailVerified) {
        shouldResetSending = false;
        startRedirect("/admin/dashboard", {
        delayMs: 75,
        onBeforeNavigate: () => {
          setLoading(false);
        },
      });
      setLoading(true);
        return;
      }
      const { sendEmailVerification } = await import("firebase/auth");
      await sendEmailVerification(user);
      setStatus({
        tone: "success",
        message: "Verification email sent. Check your inbox and spam folder.",
      });
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("verify-email: resend error", error);
      }
      setStatus({
        tone: "error",
        message: "Failed to send verification email. Try again in a minute.",
      });
    } finally {
      if (shouldResetSending) {
        setSending(false);
      }
    }
  };

  const handleCheck = async () => {
    if (testMode) {
      setLoading(true);
      void Promise.resolve().then(() => {
        setTestEmailVerified(true);
      });
      setStatus({
        tone: "success",
        message: "Test mode: verification marked complete. Redirecting…",
      });
      startRedirect("/admin/dashboard");
      return;
    }
    setLoading(true);
    await refreshUser();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold">Verify your email</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          We&rsquo;ve sent a verification link to your registered email address. Please verify to unlock admin privileges.
        </p>
      </div>

      <div
        className={`rounded-md border p-4 text-sm ${
          status?.tone === "error"
            ? "border-red-200 bg-red-50 text-red-700"
            : status?.tone === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-slate-200 bg-slate-50 text-slate-700"
        }`}
        role="status"
        aria-live="polite"
      >
        {status?.message || "Waiting for verification status…"}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={handleResend} disabled={sending || loading} type="button">
          {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
          Resend verification email
        </Button>
        <Button
          onClick={handleCheck}
          variant="secondary"
          type="button"
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
          I have verified
        </Button>
      </div>
    </div>
  );
}