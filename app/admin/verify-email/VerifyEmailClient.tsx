"use client";

import { useCallback, useEffect, useState, useId } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
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
  const {
    testEmailVerified,
    setTestEmailVerified,
    refreshCurrentUser,
    accessState,
    requiresVerification,
    syncServerSession,
    sessionSyncing,
    serverVerification,
  } = useAdminAuth();
  const headingId = useId();
  const testMode = isTestMode();
  const router = useRouter();

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
      if (user.emailVerified || !requiresVerification) {
        if (!requiresVerification) {
          setStatus({
            tone: "success",
            message: "Email verified! Redirecting to the dashboard…",
          });
          return;
        }

        const synced =
          serverVerification === "verified" || (await syncServerSession());
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
    requiresVerification,
    serverVerification,
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
    if (accessState === "unauthenticated") {
      setStatus({
        tone: "error",
        message: "You need to sign in again. Redirecting to the login page…",
      });
      return;
    }

    if (
      accessState === "authenticated_verified" &&
      (!requiresVerification || serverVerification === "verified")
    ) {
      setStatus({
        tone: "success",
        message: "Email verified! Redirecting to the dashboard…",
      });
    }
  }, [accessState, requiresVerification, serverVerification]);

  // Ensure verified users leave the verification page and that server cookies are refreshed.
  useEffect(() => {
    if (accessState !== "authenticated_verified") return;

    if (!requiresVerification || serverVerification === "verified") {
      router.replace("/admin/dashboard");
      return;
    }

    if (serverVerification === "unknown") {
      void syncServerSession();
    }
  }, [
    accessState,
    requiresVerification,
    router,
    serverVerification,
    syncServerSession,
  ]);

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
        const synced =
          serverVerification === "verified" || (await syncServerSession());
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