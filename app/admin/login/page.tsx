import { getMetadata } from "@/lib/seo-utils";
import AdminLoginForm from "./AdminLoginForm";

export const metadata = getMetadata({
  title: "Admin Login – Flavor Studios",
  description: "Access your creative command center.",
  path: "/admin/login",
  openGraph: {
    images: [
      {
        url: "https://flavorstudios.in/cover.jpg",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@flavorstudios",
    images: ["https://flavorstudios.in/cover.jpg"],
  },
  robots: "noindex, nofollow", // Prevents indexing of admin login page
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
});

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
