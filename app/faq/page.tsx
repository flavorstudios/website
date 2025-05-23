import type { Metadata } from "next"
import FAQSection from "@/components/FAQSection"

// Define FAQ data structure for schema generation
const faqCategories = [
  {
    title: "General Questions",
    items: [
      {
        question: "What is Flavor Studios?",
        answer:
          "Flavor Studios is an independent animation studio that creates original anime and 3D animated stories built in Blender.",
      },
      {
        question: "How can I support Flavor Studios?",
        answer: "You can support us via Buy Me a Coffee or YouTube Memberships, available on our Support page.",
      },
      {
        question: "How often do you release new content?",
        answer: "We typically release new content every few months.",
      },
    ],
  },
  {
    title: "Technical Questions",
    items: [
      {
        question: "What software do you use?",
        answer: "We primarily use Blender for 3D animation and editing.",
      },
      {
        question: "How long does it take to make an episode?",
        answer: "The production time varies, but it generally takes several months to complete an episode.",
      },
    ],
  },
]

export const metadata: Metadata = {
  title: "FAQ - Flavor Studios",
  description: "Find answers to common questions about Flavor Studios, our content, and how to get involved.",
  openGraph: {
    title: "FAQ - Flavor Studios",
    description: "Find answers to common questions about Flavor Studios, our content, and how to get involved.",
    type: "website",
  },
}

export default function FAQPage() {
  return <FAQSection />
}
