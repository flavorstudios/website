"use client";

import { useCallback } from "react";
import { SettingsTabs } from "@/components/admin/settings/SettingsTabs";
import type { UserSettings } from "@/lib/schemas/settings";
import { ErrorBoundary } from "../components/ErrorBoundary";

interface SettingsClientProps {
  initialTab?: string | null;
  settings: UserSettings;
  showDevHint: boolean;
  emailVerified: boolean;
  providerLocked: boolean;
}

export function SettingsClient({
  initialTab,
  settings,
  showDevHint,
  emailVerified,
  providerLocked,
}: SettingsClientProps) {
  return (
    <ErrorBoundary fallback={<SettingsRenderError showDevHint={showDevHint} />}>
      <SettingsTabs
        initialTab={initialTab ?? undefined}
        profile={{ ...settings.profile, emailVerified, providerLocked }}
        notifications={settings.notifications}
        appearance={settings.appearance}
      />
    </ErrorBoundary>
  );
}

export function SettingsLoadErrorBanner({
  message,
  detail,
  showDetail,
}: {
  message: string;
  detail?: string | null;
  showDetail: boolean;
}) {
  const handleRetry = useCallback(() => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }, []);

  return (
    <div className="space-y-3 rounded-lg border border-border/50 bg-muted/20 p-6 text-sm text-muted-foreground">
      <p>{message}</p>
      {showDetail && detail ? (
        <p className="text-xs text-muted-foreground/90">{detail}</p>
      ) : null}
      <button
        type="button"
        onClick={handleRetry}
        className="inline-flex items-center rounded-md border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
      >
        Retry loading settings
      </button>
    </div>
  );
}

function SettingsRenderError({ showDevHint }: { showDevHint: boolean }) {
  const handleReload = useCallback(() => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }, []);

  return (
    <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
      <p className="font-medium">The settings interface failed to render.</p>
      <p className="mt-2 text-xs opacity-80">
        Check the browser console and server logs for details, then reload the page.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleReload}
          className="inline-flex items-center rounded-md border border-destructive/40 bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
        >
          Reload settings
        </button>
        {showDevHint ? (
          <span className="text-xs text-destructive/80">
            Refresh to capture a client-side stack trace in the console.
          </span>
        ) : null}
      </div>
    </div>
  );
}