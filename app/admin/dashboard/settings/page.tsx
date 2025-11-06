import { getMetadata } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants";
import { SettingsTabs } from "@/components/admin/settings/SettingsTabs";
import { PageHeader } from "@/components/admin/page-header";
import { loadSettings } from "./actions";
import { SettingsAccessError } from "./errors";
import { getCurrentAdminUid } from "@/lib/settings/server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { unwrapPageProps } from "@/types/next";
import type { PageProps } from "@/types/next";
import { logError } from "@/lib/log";
import { ErrorBoundary } from "../components/ErrorBoundary";
import type { SettingsErrorCode } from "./errors";
import { getSessionEmailFromCookies, isAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = getMetadata({
  title: `Settings – ${SITE_NAME} Admin`,
  description: `Manage your personal admin preferences for ${SITE_NAME}.`,
  path: "/admin/dashboard/settings",
  robots: "noindex, nofollow",
  openGraph: {
    title: `Settings – ${SITE_NAME} Admin`,
    description: `Manage your personal admin preferences for ${SITE_NAME}.`,
    url: `${SITE_URL}/admin/dashboard/settings`,
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/cover.jpg`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} Cover Image`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    title: `Settings – ${SITE_NAME} Admin`,
    description: `Manage your personal admin preferences for ${SITE_NAME}.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
});

const DEFAULT_LOAD_ERROR =
  "Admin settings are currently unavailable. Please try again or contact an administrator.";

const SETTINGS_ERROR_COPY: Record<SettingsErrorCode, string> = {
  UNAUTHORIZED:
    "Your admin session has expired or lacks permission. Log in again to manage settings.",
  ADMIN_SDK_UNAVAILABLE:
    "Admin Firestore is not configured. Set FIREBASE_SERVICE_ACCOUNT_KEY (or FIREBASE_SERVICE_ACCOUNT_JSON) and redeploy.",
  FIRESTORE_ERROR:
    "We couldn't read admin settings from Firestore. Verify the service account credentials and retry.",
  EMAIL_TRANSPORT_UNCONFIGURED:
    "Email delivery is not configured. Add SMTP credentials to enable verification emails.",
  ROLLBACK_INVALID:
    "The rollback window expired. Reload the page to fetch the latest settings.",
};

function SettingsUnauthorized() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <div className="rounded-lg border border-border/60 bg-muted/30 p-6 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">
          Your email is not on the admin allow list.
        </p>
        <p className="mt-2">
          Contact the site owner to confirm your access or try signing in with a different account.
        </p>
        <a
          href="/admin/dashboard"
          className="mt-4 inline-flex items-center rounded-md border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          Return to dashboard
        </a>
      </div>
    </div>
  );
}

function SettingsLoadErrorBanner({
  message,
  detail,
  showDetail,
}: {
  message: string;
  detail?: string | null;
  showDetail: boolean;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-border/50 bg-muted/20 p-6 text-sm text-muted-foreground">
      <p>{message}</p>
      {showDetail && detail ? (
        <p className="text-xs text-muted-foreground/90">{detail}</p>
      ) : null}
      <button
        type="button"
        onClick={() => {
          if (typeof window !== "undefined") {
            window.location.reload();
          }
        }}
        className="inline-flex items-center rounded-md border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
      >
        Retry loading settings
      </button>
    </div>
  );
}

function SettingsRenderError({ showDevHint }: { showDevHint: boolean }) {
  return (
    <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
      <p className="font-medium">The settings interface failed to render.</p>
      <p className="mt-2 text-xs opacity-80">
        Check the browser console and server logs for details, then reload the page.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.location.reload();
            }
          }}
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

type SettingsPageProps = PageProps<Record<string, never>, { tab?: string | string[] }>;

type LoadErrorState = {
  message: string;
  detail?: string | null;
};

export default async function SettingsPage(props: SettingsPageProps) {
  const sessionEmail = await getSessionEmailFromCookies();
  if (!isAdmin(sessionEmail)) {
    return <SettingsUnauthorized />;
  }

  const { searchParams } = await unwrapPageProps(props);
  const resolvedSearchParams = searchParams ?? {};
  const tab = Array.isArray(resolvedSearchParams.tab)
    ? resolvedSearchParams.tab[0]
    : resolvedSearchParams.tab;
  const showDetail = process.env.NODE_ENV !== "production";

  let settings: Awaited<ReturnType<typeof loadSettings>> | null = null;
  let loadError: LoadErrorState | null = null;

  try {
    settings = await loadSettings();
  } catch (error) {
    if (error instanceof SettingsAccessError) {
      const message = SETTINGS_ERROR_COPY[error.code] ?? DEFAULT_LOAD_ERROR;
      loadError = { message, detail: showDetail ? error.message : null };
      logError("admin-settings:page", error, { code: error.code });
    } else {
      loadError = {
        message: DEFAULT_LOAD_ERROR,
        detail: showDetail && error instanceof Error ? error.message : null,
      };
      logError("admin-settings:page", error);
    }
  }

  if (!settings || loadError) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6 pb-24">
        <PageHeader
          level={1}
          title="Settings"
          description="Manage your profile, notifications, and appearance preferences"
        />
        <SettingsLoadErrorBanner
          message={(loadError ?? { message: DEFAULT_LOAD_ERROR }).message}
          detail={loadError?.detail ?? null}
          showDetail={showDetail}
        />
      </div>
    );
  }

  let emailVerified = false;
  let providerLocked = false;
  try {
    const uid = await getCurrentAdminUid();
    const auth = getAdminAuth();
    const record = await auth.getUser(uid);
    emailVerified = record.emailVerified ?? false;
    providerLocked = record.providerData.some((provider) => provider.providerId !== "password");
  } catch {
    // ignore admin auth failures; fall back to defaults

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 pb-24">
      <PageHeader
        level={1}
        title="Settings"
        description="Manage your profile, notifications, and appearance preferences"
      />
      <ErrorBoundary fallback={<SettingsRenderError showDevHint={showDetail} />}>
        <SettingsTabs
          initialTab={tab}
          profile={{ ...settings.profile, emailVerified, providerLocked }}
          notifications={settings.notifications}
          appearance={settings.appearance}
        />
      </ErrorBoundary>
    </div>
  );
}
