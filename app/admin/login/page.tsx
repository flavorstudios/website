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
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  // Schema/JSON-LD intentionally removed (now in head.tsx)
});

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
