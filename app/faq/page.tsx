// app/faq/page.tsx

import { getMetadata } from "@/lib/seo/metadata";
import { getSchema } from "@/lib/seo/schema";
import { SITE_NAME, SITE_URL, SITE_LOGO_URL, SITE_BRAND_TWITTER } from "@/lib/constants";
import { StructuredData } from "@/components/StructuredData";
import FaqPageClient, { FaqEntry } from "./FaqPageClient"; // Import FaqEntry!

const faqData: FaqEntry[] = [
  // Most Popular Questions
  {
    id: "what-is-flavor-studios",
    question: "What is Flavor Studios?",
    answer:
      "Flavor Studios is a creative studio focused on producing high-quality anime-inspired content. We craft original videos, blog posts, and interactive experiences designed for anime fans across the globe.",
    category: "About Flavor Studios",
    tags: ["popular"],
    relatedQuestions: [],
  },
  {
    id: "how-to-support",
    question: "How can I support Flavor Studios?",
    answer:
      "You can support us by subscribing to our YouTube channel, sharing our content, or donating through our Buy Me a Coffee page: https://buymeacoffee.com/flavorstudios",
    category: "Support & Donations",
    tags: ["popular"],
    relatedQuestions: [],
  },
  {
    id: "content-release-schedule",
    question: "How often do you release new content?",
    answer:
      "Blog posts go up 2 to 3 times per week. Animated videos are released weekly, though timelines may vary during larger productions.",
    category: "Blog & Watch Pages",
    tags: ["popular"],
    relatedQuestions: [],
  },
  // Recently Added Questions
  {
    id: "suggest-topics",
    question: "Can I suggest topics for future videos or blog posts?",
    answer:
      "Share your ideas via the contact form or comment on our social media posts. We review all suggestions with care.",
    category: "General & Contact",
    tags: ["new"],
    relatedQuestions: [],
  },
  {
    id: "donation-rewards",
    question: "Do I receive anything for donating?",
    answer:
      "Yes. Depending on your donation, you may receive shoutouts, early previews, or behind-the-scenes access.",
    category: "Support & Donations",
    tags: ["new"],
    relatedQuestions: [],
  },
  {
    id: "content-usage",
    question: "Can I use your content in my own projects?",
    answer:
      "Our content is protected by copyright. For educational use or limited excerpts, see our Media Usage Policy. For commercial use or substantial portions, contact us for permission.",
    category: "Legal & Privacy",
    tags: ["new"],
    relatedQuestions: [],
  },
  {
    id: "mobile-app",
    question: "Do you have a mobile app?",
    answer:
      "Not yet. However, our website is a Progressive Web App (PWA), allowing you to install it on your phone or desktop for an app-like experience, including offline access.",
    category: "Technical & Notifications",
    tags: ["new"],
    relatedQuestions: [],
  },
  // About Flavor Studios
  {
    id: "original-anime",
    question: "Do you create original anime?",
    answer:
      "While we primarily focus on anime analysis, reviews, and educational content, we also produce short-form original animations. Our long-term goal is to release full-length original anime series, and we're actively working toward that vision.",
    category: "About Flavor Studios",
    tags: [],
    relatedQuestions: ["content-release-schedule", "find-content"],
  },
  {
    id: "find-content",
    question: "Where can I find all your content?",
    answer:
      "You can explore our content on our website, YouTube channel, and social media platforms. For the most organized and up-to-date collection—including blogs, videos, and interactive features—this website is your best destination.",
    category: "About Flavor Studios",
    tags: [],
    relatedQuestions: [],
  },
  // General & Contact
  {
    id: "response-time",
    question: "How long does it take to get a response?",
    answer:
      "We typically respond to all inquiries within 24 to 48 hours on business days. For urgent matters, please mention it in the subject line.",
    category: "General & Contact",
    tags: [],
    relatedQuestions: [],
  },
  {
    id: "guest-posts",
    question: "Do you accept guest blog posts or collaborations?",
    answer:
      "Yes! We occasionally feature guest writers and collaborate with fellow creators. Please reach out through our Contact Page with your proposal and work samples.",
    category: "General & Contact",
    tags: [],
    relatedQuestions: ["suggest-topics"],
  },
  {
    id: "in-person-visits",
    question: "Can I visit Flavor Studios in person?",
    answer:
      "We're a digital-first studio and do not currently offer in-person visits.",
    category: "General & Contact",
    tags: [],
    relatedQuestions: [],
  },
  {
    id: "report-technical-issue",
    question: "How can I report a technical issue with the website?",
    answer:
      'Use the contact form, select "Support," and describe your issue. Screenshots and browser/device info are helpful.',
    category: "General & Contact",
    tags: [],
    relatedQuestions: ["website-not-working"],
  },
  // Support & Donations
  {
    id: "payment-security",
    question: "Is my payment information secure?",
    answer:
      "Yes. We use Stripe through Buy Me a Coffee for all transactions, with bank-level encryption. We never store your full payment data.",
    category: "Support & Donations",
    tags: [],
    relatedQuestions: [],
  },
  {
    id: "account-required",
    question: "Do I need an account to donate?",
    answer: "No, you can donate directly—no registration required.",
    category: "Support & Donations",
    tags: [],
    relatedQuestions: [],
  },
  {
    id: "donation-usage",
    question: "Where does my donation go?",
    answer:
      "Your support helps fund animation tools, site hosting, and our original projects like anime production and studio upgrades.",
    category: "Support & Donations",
    tags: [],
    relatedQuestions: ["donation-rewards"],
  },
  // Legal & Privacy
  {
    id: "legal-policies",
    question: "Where can I find your legal and privacy policies?",
    answer: "All policies—including Privacy, Terms, DMCA, and Cookie Policy—are linked in the footer of every page.",
    category: "Legal & Privacy",
    tags: [],
    relatedQuestions: [],
  },
  {
    id: "personal-data",
    question: "Do you collect personal data?",
    answer:
      "Only essential information like your name or email, used solely for communication. See our Privacy Policy for details.",
    category: "Legal & Privacy",
    tags: [],
    relatedQuestions: ["data-protection", "cookies-trackers"],
  },
  {
    id: "cookies-trackers",
    question: "How do you handle cookies and trackers?",
    answer:
      "We use cookies to improve your experience. You can adjust your preferences via the CookieYes banner on our site.",
    category: "Legal & Privacy",
    tags: [],
    relatedQuestions: [],
  },
  // Blog & Watch Pages
  {
    id: "anime-selection",
    question: "How do you select which anime to review?",
    answer:
      "We review popular releases, classics, and hidden gems—based on team interests, trends, and community requests.",
    category: "Blog & Watch Pages",
    tags: [],
    relatedQuestions: [],
  },
  // Technical & Notifications
  {
    id: "website-not-working",
    question: "The website or video isn't working properly. What should I do?",
    answer:
      "Refresh your browser or clear your cache. If issues persist, report them via the contact form with full details.",
    category: "Technical & Notifications",
    tags: [],
    relatedQuestions: [],
  },
  {
    id: "content-notifications",
    question: "How can I be notified of new content?",
    answer:
      "Subscribe to our newsletter, enable YouTube notifications, or follow us on Instagram, Threads, and X for updates.",
    category: "Technical & Notifications",
    tags: [],
    relatedQuestions: [],
  },
  {
    id: "data-protection",
    question: "Is my personal data protected?",
    answer:
      "Yes. We use modern data security protocols. See our Privacy Policy to understand how your data is collected and used.",
    category: "Technical & Notifications",
    tags: [],
    relatedQuestions: ["personal-data"],
  },
];

// --- SEO Metadata ---
export const metadata = getMetadata({
  title: `${SITE_NAME} FAQ – Anime & Support Help`,
  description: `Get answers to frequently asked questions about ${SITE_NAME}, supporting us, using our content, and how we create original anime and stories.`,
  path: "/faq",
  robots: "index,follow",
  openGraph: {
    title: `${SITE_NAME} FAQ – Anime & Support Help`,
    description: `Get answers to frequently asked questions about ${SITE_NAME}, supporting us, using our content, and how we create original anime and stories.`,
    type: "website",
    images: [{ url: `${SITE_URL}/cover.jpg`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    title: `${SITE_NAME} FAQ – Anime & Support Help`,
    description: `Get answers to frequently asked questions about ${SITE_NAME}, supporting us, using our content, and how we create original anime and stories.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
});

// --- JSON-LD FAQPage Schema ---
const faqPageSchema = getSchema({
  type: "FAQPage",
  path: "/faq",
  title: `${SITE_NAME} FAQ – Anime & Support Help`,
  description: `Get answers to frequently asked questions about ${SITE_NAME}, supporting us, using our content, and how we create original anime and stories.`,
  image: SITE_LOGO_URL,
  mainEntity: faqData.map(item => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
});

// --- FAQ Page Component ---
export default function FAQPage() {
  return (
    <>
      <StructuredData schema={faqPageSchema} />
      <FaqPageClient faqData={faqData} />
    </>
  );
}
