import { getMetadata } from "@/lib/seo-utils"
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants"
import { SettingsTabs } from "@/components/admin/settings/SettingsTabs"
import { PageHeader } from "@/components/admin/page-header"
import { loadSettings } from "./actions"
import { SettingsAccessError } from "./errors"
import { getCurrentAdminUid } from "@/lib/settings/server"
import { getAdminAuth } from "@/lib/firebase-admin"
import type { PageProps } from "@/types/next"
import { logError } from "@/lib/log"
import { ErrorBoundary } from "../components/ErrorBoundary"
import type { SettingsErrorCode } from "./errors"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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
})

type SettingsPageProps = PageProps<Record<string, never>, { tab?: string | string[] }>;

export default async function SettingsPage({
  searchParams,
}: SettingsPageProps) {
  let settings: Awaited<ReturnType<typeof loadSettings>> | null = null
  let loadError: string | null = null
  let loadErrorDetail: string | null = null
  try {
    settings = await loadSettings()
  } catch (error) {
    const defaultMessage =
      "Admin settings are currently unavailable. Please try again or contact an administrator."
    if (error instanceof SettingsAccessError) {
      const errorMessages: Record<SettingsErrorCode, string> = {
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
      }
      loadError = errorMessages[error.code] ?? defaultMessage
      if (process.env.NODE_ENV !== "production") {
        loadErrorDetail = error.message
      }
      logError("admin-settings:page", error, { code: error.code })
    } else {
      loadError = defaultMessage
      if (error instanceof Error && process.env.NODE_ENV !== "production") {
        loadErrorDetail = error.message
      }
      logError("admin-settings:page", error)
    }
  }
  const resolvedSearchParams = (await searchParams) ?? {}
  const tab = Array.isArray(resolvedSearchParams.tab)
    ? resolvedSearchParams.tab[0]
    : resolvedSearchParams.tab
  let emailVerified = false
  let providerLocked = false
  if (settings) {
    try {
      const uid = await getCurrentAdminUid()
      const auth = getAdminAuth()
      const record = await auth.getUser(uid)
      emailVerified = record.emailVerified ?? false
      providerLocked = record.providerData.some((provider) => provider.providerId !== "password")
    } catch {
      // fall back to defaults if admin SDK unavailable
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 pb-24">
      <PageHeader
        level={1}
        title="Settings"
        description="Manage your profile, notifications, and appearance preferences"
      />
      {settings ? (
        <ErrorBoundary
          fallback={
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
              <p className="font-medium">The settings interface failed to render.</p>
              <p className="mt-2 text-xs opacity-80">
                Check the browser console and server logs for details, then reload the page.
              </p>
            </div>
          }
        >
          <SettingsTabs
            initialTab={tab}
            profile={{ ...settings.profile, emailVerified, providerLocked }}
            notifications={settings.notifications}
            appearance={settings.appearance}
          />
        </ErrorBoundary>
      ) : (
        <div className="space-y-2 rounded-lg border border-border/50 bg-muted/20 p-6 text-sm text-muted-foreground">
          <p>{loadError}</p>
          {loadErrorDetail ? (
            <p className="text-xs text-muted-foreground/90">{loadErrorDetail}</p>
          ) : null}
        </div>
      )}
    </div>
  )
}
