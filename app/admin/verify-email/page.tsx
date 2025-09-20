import VerifyEmailClient from "./VerifyEmailClient";
import { getMetadata } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants";

export const metadata = getMetadata({
  title: `Verify Admin Email – ${SITE_NAME}`,
  description: `Confirm your administrator email to unlock the ${SITE_NAME} dashboard and tools.`,
  path: "/admin/verify-email",
  robots: "noindex, nofollow",
  openGraph: {
    title: `Verify Admin Email – ${SITE_NAME}`,
    description: `Confirm your administrator email to unlock the ${SITE_NAME} dashboard and tools.`,
    type: "website",
    siteName: SITE_NAME,
    images: [
      {
        url: `${SITE_URL}/cover.jpg`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} email verification`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    title: `Verify Admin Email – ${SITE_NAME}`,
    description: `Confirm your administrator email to unlock the ${SITE_NAME} dashboard and tools.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
});

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f8fd] p-6">
      <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-md">
        <VerifyEmailClient />
      </div>
    </div>
  );
}