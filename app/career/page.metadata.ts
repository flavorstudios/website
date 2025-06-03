import { getMetadata } from "@/lib/seo-utils"

export const metadata = getMetadata({
  title: "Careers & Opportunities | Flavor Studios",
  description:
    "Discover creative career opportunities at Flavor Studios. Join our talent list for future roles in animation, writing, voiceover, and digital media. Be part of our journey.",
  path: "/career",
  openGraph: {
    images: ["https://flavorstudios.in/og-image.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@flavorstudios",
    image: "https://flavorstudios.in/og-image.png",
  },
  schema: {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": "Creative Talent (All Roles Filled)",
    "description":
      "All roles are currently filled at Flavor Studios, but we're always looking for creative talent in animation, writing, voiceover, and media. Join our talent list to be notified of future openings.",
    "datePosted": "2025-05-09",
    "validThrough": "2025-12-31",
    "employmentType": "FULL_TIME",
    "hiringOrganization": {
      "@type": "Organization",
      "name": "Flavor Studios",
      "sameAs": "https://flavorstudios.in",
      "url": "https://flavorstudios.in",
      "logo": "https://flavorstudios.in/og-image.png"
    },
    "jobLocationType": "TELECOMMUTE",
    "applicantLocationRequirements": {
      "@type": "Country",
      "name": "Remote (Global)"
    },
    "directApply": false,
    "url": "https://flavorstudios.in/career"
  },
  robots: "index, follow"
});
