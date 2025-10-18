import { getMetadata } from "@/lib/seo-utils"
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants"
import { SettingsTabs } from "@/components/admin/settings/SettingsTabs"
import { loadSettings } from "./actions"
import { getCurrentAdminUid } from "@/lib/settings"
import { getAdminAuth } from "@/lib/firebase-admin"

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

interface SettingsPageProps {
  searchParams?: { tab?: string }
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const settings = await loadSettings()
  let emailVerified = false
  let providerLocked = false
  try {
    const uid = await getCurrentAdminUid()
    const auth = getAdminAuth()
    const record = await auth.getUser(uid)
    emailVerified = record.emailVerified ?? record.email_verified ?? false
    providerLocked = record.providerData.some((provider) => provider.providerId !== "password")
  } catch {
    // fall back to defaults if admin SDK unavailable
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 pb-24">
      <SettingsTabs
        initialTab={searchParams?.tab}
        profile={{ ...settings.profile, emailVerified, providerLocked }}
        notifications={settings.notifications}
        appearance={settings.appearance}
      />
    </div>
  )
}
