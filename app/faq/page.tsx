import type { Metadata } from "next"
import FAQClientPage from "./FAQClientPage"

export const metadata: Metadata = {
  title: "FAQ - Frequently Asked Questions",
  description:
    "Find answers to common questions about Flavor Studios, our content, support, legal policies, and how to get involved with our independent animation studio.",
  openGraph: {
    title: "FAQ - Frequently Asked Questions | Flavor Studios",
    description: "Find answers to common questions about Flavor Studios, our content, and how to get involved.",
    type: "website",
    url: "https://flavorstudios.in/faq",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ - Frequently Asked Questions | Flavor Studios",
    description: "Find answers to common questions about Flavor Studios, our content, and how to get involved.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://flavorstudios.in/faq",
  },
}

export default function FAQPage() {
  return <FAQClientPage />
}
