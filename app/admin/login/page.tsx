import { getMetadata } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import AdminLoginForm from "./AdminLoginForm";

export const metadata = getMetadata({
  title: `Admin Login – ${SITE_NAME}`,
  description: `Login securely to manage ${SITE_NAME} content, blogs, and creative assets.`,
  path: "/admin/login",
  robots: "noindex, nofollow", // Explicit and correct for admin login
  openGraph: {
    title: `Admin Login – ${SITE_NAME}`,
    description: `Login securely to manage ${SITE_NAME} content, blogs, and creative assets.`,
    url: `${SITE_URL}/admin/login`, // Dynamically constructed URL
    type: "website",
    site_name: SITE_NAME, // Automatically handled by the helper
    images: [
      {
        url: `${SITE_URL}/cover.jpg`, // Dynamically generated URL
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@flavorstudios",
    creator: "@flavorstudios",
    title: `Admin Login – ${SITE_NAME}`,
    description: `Login securely to manage ${SITE_NAME} content, blogs, and creative assets.`,
    images: [`${SITE_URL}/cover.jpg`], // Dynamically generated URL
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  // Schema/JSON-LD intentionally removed (now in head.tsx)
});

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
