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
    title: "Contact Flavor Studios – Collaborate or Inquire",
    description:
      "Have a question or proposal? Contact Flavor Studios for support, collaborations, or general inquiries. We respond within 24–48 hours.",
    images: ["https://flavorstudios.in/cover.jpg"],
  },
  schema: {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Flavor Studios",
    description:
      "Contact Flavor Studios for support, collaborations, or inquiries. We typically respond within 24 to 48 hours.",
    url: "https://flavorstudios.in/contact",
    publisher: {
      "@type": "Organization",
      name: "Flavor Studios",
      url: "https://flavorstudios.in",
      logo: {
        "@type": "ImageObject",
        url: "https://flavorstudios.in/logo.png",
      },
      contactPoint: [
        {
          "@type": "ContactPoint",
          email: "contact@flavorstudios.in",
          contactType: "customer support",
          url: "https://flavorstudios.in/contact",
        },
      ],
    },
  },
});
