import { getMetadata } from "@/lib/seo-utils";

export const metadata = getMetadata({
  title: "Contact – Flavor Studios",
  description: "Contact Flavor Studios for collaborations, support, or general inquiries. Reach out via email, social, or our form. We reply within 24–48 hours.",
  path: "/contact",
  openGraph: {
    images: ["https://flavorstudios.in/cover.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@flavorstudios",
    creator: "@flavorstudios",
    image: "https://flavorstudios.in/cover.jpg",
  },
  schema: {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact – Flavor Studios",
    description: "Contact Flavor Studios for collaborations, support, or general inquiries. We reply within 24–48 hours.",
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
