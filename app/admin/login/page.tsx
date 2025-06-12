import { getMetadata } from "@/lib/seo-utils";
import AdminLoginForm from "./AdminLoginForm";

export const metadata = getMetadata({
  title: "Admin Login – Flavor Studios",
  description: "Login securely to manage Flavor Studios content, blogs, and creative assets.",
  path: "/admin/login",
  robots: "noindex, nofollow", // Explicit and correct for admin login
  openGraph: {
    title: "Admin Login – Flavor Studios",
    description: "Login securely to manage Flavor Studios content, blogs, and creative assets.",
    url: "https://flavorstudios.in/admin/login",
    type: "website",
    site_name: "Flavor Studios",
    images: [
      {
        url: "https://flavorstudios.in/cover.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@flavorstudios",
    creator: "@flavorstudios",
    title: "Admin Login – Flavor Studios",
    description: "Login securely to manage Flavor Studios content, blogs, and creative assets.",
    images: ["https://flavorstudios.in/cover.jpg"],
  },
  schema: {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Admin Login – Flavor Studios",
    description: "Login securely to manage Flavor Studios content, blogs, and creative assets.",
    url: "https://flavorstudios.in/admin/login",
    applicationCategory: "AdministrativeApplication",
    publisher: {
      "@type": "Organization",
      name: "Flavor Studios",
      url: "https://flavorstudios.in",
      logo: {
        "@type": "ImageObject",
        url: "https://flavorstudios.in/logo.png",
      },
      sameAs: [
        "https://www.youtube.com/@flavorstudios",
        "https://www.instagram.com/flavorstudios",
        "https://twitter.com/flavor_studios",
        "https://www.facebook.com/flavourstudios",
        "https://www.threads.net/@flavorstudios",
        "https://discord.com/channels/@flavorstudios",
        "https://t.me/flavorstudios",
        "https://www.reddit.com/r/flavorstudios/",
        "https://bsky.app/profile/flavorstudios.bsky.social"
      ]
    },
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
});

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
