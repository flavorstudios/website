// app/faq/page.tsx
import FaqPageClient from "./FaqPageClient"

export const metadata = {
  title: "FAQ | Flavor Studios",
  description: "Frequently asked questions about Flavor Studios, anime content, donations, legal info, and more."
  // ...other SEO stuff if you need it
}

export default function FAQPage() {
  // SSR-friendly shell, renders client FAQ
  return <FaqPageClient />
}
