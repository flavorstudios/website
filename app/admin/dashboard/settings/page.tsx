import { getMetadata } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants";
import { PageHeader } from "@/components/admin/page-header";
import { loadSettings } from "./actions";
import { SettingsAccessError } from "./errors";
import { getCurrentAdminUid } from "@/lib/settings/server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { unwrapPageProps } from "@/types/next";
import type { PageProps } from "@/types/next";
import { logError } from "@/lib/log";
import type { SettingsErrorCode } from "./errors";
import { getSessionEmailFromCookies, isAdmin } from "@/lib/admin-auth";
import { SettingsClient, SettingsLoadErrorBanner } from "./SettingsClient";

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

  const header = (
    <PageHeader
      level={1}
      title="Settings"
      description="Manage your profile, notifications, and appearance preferences"
    />
  );

  if (!settings || loadError) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6 pb-24">
        {header}
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
    providerLocked = (record.providerData ?? []).some(
      (provider) => provider.providerId !== "password",
    );
  } catch (error) {
    logError("admin-settings:page:auth", error);
    emailVerified = false;
    providerLocked = false;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 pb-24">
      {header}
      <SettingsClient
        initialTab={tab}
        settings={settings}
        showDevHint={showDetail}
        emailVerified={emailVerified}
        providerLocked={providerLocked}
      />
    </div>
  );
}
