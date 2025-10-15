import SignupForm from "./SignupForm";
import { getMetadata } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants";

export const runtime = 'nodejs'

export const metadata = getMetadata({
  title: `Create Admin Account – ${SITE_NAME}`,
  description: `Provision a secure administrator account to manage ${SITE_NAME} content and tooling.`,
  path: "/admin/signup",
  robots: "noindex, nofollow",
  openGraph: {
    title: `Create Admin Account – ${SITE_NAME}`,
    description: `Provision a secure administrator account to manage ${SITE_NAME} content and tooling.`,
    type: "website",
    siteName: SITE_NAME,
    images: [
      {
        url: `${SITE_URL}/cover.jpg`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} admin signup hero`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    title: `Create Admin Account – ${SITE_NAME}`,
    description: `Provision a secure administrator account to manage ${SITE_NAME} content and tooling.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function AdminSignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f8fd] p-6">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold">Create your admin account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Access the secure console for {SITE_NAME} content and operations.
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}