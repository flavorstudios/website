"use client";

import { useCallback, useEffect, useState, useId } from "react";
import type { User } from "firebase/auth";
import { Loader2, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { clientEnv } from "@/env.client";
import { useAdminAuth } from "@/components/AdminAuthProvider";
import { isTestMode } from "@/config/flags";
import { PageHeader } from "@/components/admin/page-header";

type StatusMessage = {
  tone: "neutral" | "success" | "error";
  message: string;
};

export default function VerifyEmailClient() {
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sessionSynced, setSessionSynced] = useState(false);
  const [sessionSyncing, setSessionSyncing] = useState(false);
  const {
    testEmailVerified,
    setTestEmailVerified,
    refreshCurrentUser,
    accessState,
  } = useAdminAuth();
  const headingId = useId();

  const requireVerification =
    clientEnv.NEXT_PUBLIC_REQUIRE_ADMIN_EMAIL_VERIFICATION === "true";
  const testMode = isTestMode();

  const syncServerSession = useCallback(
    async (user: User | null) => {
      if (testMode) {
        return true;
      }
      if (!user) {
        return false;
      }
      if (sessionSynced || sessionSyncing) {
        return sessionSynced;
      }
      setSessionSyncing(true);
      try {
        const idToken = await user.getIdToken(true);
        const response = await fetch("/api/admin/email-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ idToken }),
        });
        if (!response.ok) {
          return false;
        }
        setSessionSynced(true);
        return true;
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("verify-email: session sync failed", error);
        }
        return false;
      } finally {
        setSessionSyncing(false);
      }
    },
    [sessionSynced, sessionSyncing, testMode]
  );

  const evaluateVerification = useCallback(async () => {
    if (testMode) {
      const verified =
        testEmailVerified ??
        (typeof window !== "undefined"
          ? window.localStorage.getItem("admin-test-email-verified") === "true"
          : false);
      if (verified) {
        setStatus({
          tone: "success",
          message:
            "Test mode: verification marked complete. Redirecting to the dashboard…",
        });
      } else {
        setStatus({
          tone: "neutral",
          message:
            "Test mode: set admin-test-email-verified to true in localStorage or click “I have verified” once ready.",
        });
      }
      return;
    }

    try {
      const user = await refreshCurrentUser();
      if (!user) {
        setStatus({
          tone: "error",
          message: "Your session has expired. Please sign in again.",
        });
        return;
      }
      if (user.emailVerified || !requireVerification) {
        const synced = await syncServerSession(user);
        setStatus({
          tone: synced ? "success" : "error",
          message: synced
            ? "Email verified! Redirecting to the dashboard…"
            : "Email verified, but we couldn't refresh your session. Please sign in again.",
        });
        return;
      }
      setStatus({
        tone: "neutral",
        message:
          "We sent a verification link to your inbox. Once verified, click “I have verified” to continue.",
      });
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("verify-email: refresh error", error);
      }
      setStatus({
        tone: "error",
        message: "We couldn't verify your status. Please try again shortly.",
      });
    }
  }, [
    refreshCurrentUser,
    requireVerification,
    syncServerSession,
    testEmailVerified,
    testMode,
  ]);

  const runStatusCheck = useCallback(async () => {
    setLoading(true);
    try {
      await evaluateVerification();
    } finally {
      setLoading(false);
    }
  }, [evaluateVerification]);

  useEffect(() => {
    if (!testMode || typeof window === "undefined") {
      return;
    }

    if (window.localStorage.getItem("admin-test-email-verified") === null) {
      window.localStorage.setItem("admin-test-email-verified", "false");
    }
  }, [testMode]);

  useEffect(() => {
    void runStatusCheck();
  }, [runStatusCheck]);

  useEffect(() => {
    if (accessState === "authenticated_verified") {
      setStatus({
        tone: "success",
        message: "Email verified! Redirecting to the dashboard…",
      });
    } else if (accessState === "unauthenticated") {
      setStatus({
        tone: "error",
        message: "You need to sign in again. Redirecting to the login page…",
      });
    }
  }, [accessState]);

  const handleResend = async () => {
    if (testMode) {
      setStatus({
        tone: "neutral",
        message:
          "Test mode: pretend email sent. Toggle admin-test-email-verified in localStorage to simulate verification.",
      });
      return;
    }
    try {
      setSending(true);
      const refreshedUser = await refreshCurrentUser();
      if (!refreshedUser) {
        setStatus({
          tone: "error",
          message: "Your session expired. Please log in again.",
        });
        return;
      }
      if (refreshedUser.emailVerified) {
        const synced = await syncServerSession(refreshedUser);
        setStatus({
          tone: synced ? "success" : "error",
          message: synced
            ? "Email already verified! Redirecting to the dashboard…"
            : "Email verified, but we couldn't refresh your session. Please sign in again.",
        });
        return;
      }
      const { sendEmailVerification } = await import("firebase/auth");
      await sendEmailVerification(refreshedUser);
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
      setSending(false);
    }
  };

  const handleCheck = async () => {
    if (testMode) {
      setLoading(true);
      void Promise.resolve().then(() => {
        setTestEmailVerified(true);
        if (typeof window !== "undefined") {
          window.localStorage.setItem("admin-test-email-verified", "true");
        }
      });
      setStatus({
        tone: "success",
        message: "Test mode: verification marked complete. Redirecting…",
      });
      setLoading(false);
      return;
    }
    await runStatusCheck();
  };

  return (
    <div className="space-y-6">
      <section
        aria-labelledby={headingId}
        className="flex flex-col items-center text-center gap-4"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="h-6 w-6" aria-hidden="true" />
        </div>
        <PageHeader
          headingId={headingId}
          title="Verify your email"
          description="We've sent a verification link to your registered email address. Please verify to unlock admin privileges."
          className="mb-0 text-center"
          containerClassName="flex-col items-center gap-2"
          headingClassName="text-2xl font-semibold"
          descriptionClassName="mt-2 max-w-sm text-sm text-muted-foreground"
          level={2}
        />
      </section>

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
        <Button
          onClick={handleResend}
          disabled={sending || loading || sessionSyncing}
          type="button"
        >
          {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
          Resend verification email
        </Button>
        <Button
          onClick={handleCheck}
          variant="secondary"
          type="button"
          disabled={loading || sessionSyncing}
          aria-label="I have verified"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
          I have verified
        </Button>
      </div>
    </div>
  );
}