import { getMetadata } from "@/lib/seo-utils"
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants"
import { SettingsTabs } from "@/components/admin/settings/SettingsTabs"
import { PageHeader } from "@/components/admin/page-header"
import { loadSettings } from "./actions"
import { getCurrentAdminUid } from "@/lib/settings/server"
import { getAdminAuth } from "@/lib/firebase-admin"
import type { SearchParams } from "@/types/next"

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

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: SearchParams<{ tab?: string | string[] }>;
}) {
  let settings: Awaited<ReturnType<typeof loadSettings>> | null = null
  let loadError: string | null = null
  try {
    settings = await loadSettings()
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Failed to load admin settings', error)
    }
    loadError =
      'Settings are currently unavailable. Configure FIREBASE_SERVICE_ACCOUNT_KEY or disable ADMIN_BYPASS to enable this page.'
  }
  const resolvedSearchParams = searchParams ? await searchParams : {}
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
        <SettingsTabs
          initialTab={tab}
          profile={{ ...settings.profile, emailVerified, providerLocked }}
          notifications={settings.notifications}
          appearance={settings.appearance}
        />
      ) : (
        <div className="rounded-lg border border-border/50 bg-muted/20 p-6 text-sm text-muted-foreground">
          {loadError}
        </div>
      )}
    </div>
  )
}
