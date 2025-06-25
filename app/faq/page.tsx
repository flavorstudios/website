// app/faq/page.tsx
import dynamic from "next/dynamic";

// Dynamically import your client component for better bundle splitting and SSR
const FAQPageClient = dynamic(() => import("./faq-page-client"), { ssr: false });

export default function FAQPage() {
  return <FAQPageClient />;
}
