import { getMetadata } from "@/lib/seo-utils";
import { SITE_BRAND_TWITTER, SITE_NAME, SITE_URL } from "@/lib/constants";

import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata = getMetadata({
  title: `Reset Admin Password – ${SITE_NAME}`,
  description: `Request a secure password reset link for your ${SITE_NAME} admin account.`,
  path: "/admin/forgot-password",
  robots: "noindex, nofollow",
  openGraph: {
    title: `Reset Admin Password – ${SITE_NAME}`,
    description: `Request a secure password reset link for your ${SITE_NAME} admin account.`,
    type: "website",
    siteName: SITE_NAME,
    images: [
      {
        url: `${SITE_URL}/cover.jpg`,
        width: 1200,
        height: 630,
        alt: `Password reset cover for ${SITE_NAME}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    title: `Reset Admin Password – ${SITE_NAME}`,
    description: `Request a secure password reset link for your ${SITE_NAME} admin account.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

type SearchParams = {
  status?: string;
};

export default async function AdminForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  
  const notice =
    resolvedSearchParams?.status === "expired"
      ? "Your reset link expired or was already used. Please request a new one."
      : undefined;

  return <ForgotPasswordForm initialNotice={notice} />;
}