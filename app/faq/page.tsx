// app/faq/page.tsx

import dynamic from "next/dynamic"

// IMPORTANT: Import name and path matches your real file name and case
const FaqPageClient = dynamic(() => import("./FaqPageClient"), { ssr: false })

export default function FAQPage() {
  return <FaqPageClient />
}
