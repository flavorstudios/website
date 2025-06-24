import { getMetadata } from "@/lib/seo-utils";

export const metadata = getMetadata({
  title: "Contact Flavor Studios – Collaborate or Inquire",
  description:
    "Have a question or proposal? Contact Flavor Studios for support, collaborations, or general inquiries. We respond within 24–48 hours.",
  path: "/contact",
  robots: "index,follow", // Explicit: Contact pages should be indexed!
  openGraph: {
    title: "Contact Flavor Studios – Collaborate or Inquire",
    description:
      "Have a question or proposal? Contact Flavor Studios for support, collaborations, or general inquiries. We respond within 24–48 hours.",
    url: "https://flavorstudios.in/contact",
    type: "website",
    site_name: "Flavor Studios", // Always present!
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
    title: "Contact Flavor Studios – Collaborate or Inquire",
    description:
      "Have a question or proposal? Contact Flavor Studios for support, collaborations, or general inquiries. We respond within 24–48 hours.",
    images: ["https://flavorstudios.in/cover.jpg"],
  },
  // JSON-LD/schema REMOVED; now in head.tsx only!
});
