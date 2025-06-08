import { getMetadata } from "@/lib/seo-utils";

export const metadata = getMetadata({
  title: "Frequently Asked Questions – Flavor Studios",
  description: "Find answers to common questions about Flavor Studios, animation, support, and our creative process. Get the info you need to enjoy our content and community.",
  path: "/faq",
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
    "@type": "FAQPage",
    name: "Flavor Studios FAQ",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is Flavor Studios?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Flavor Studios is a creative studio focused on producing high-quality anime-inspired content. We craft original videos, blog posts, and interactive experiences designed for anime fans across the globe."
        }
      },
      {
        "@type": "Question",
        name: "How can I support Flavor Studios?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can support us by subscribing to our YouTube channel, sharing our content, or donating through our Buy Me a Coffee page: https://buymeacoffee.com/flavorstudios"
        }
      },
      {
        "@type": "Question",
        name: "How often do you release new content?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Blog posts go up 2 to 3 times per week. Animated videos are released weekly, though timelines may vary during larger productions."
        }
      },
      {
        "@type": "Question",
        name: "Can I suggest topics for future videos or blog posts?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Share your ideas via the contact form or comment on our social media posts. We review all suggestions with care."
        }
      },
      {
        "@type": "Question",
        name: "Do I receive anything for donating?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Depending on your donation, you may receive shoutouts, early previews, or behind-the-scenes access."
        }
      },
      {
        "@type": "Question",
        name: "Can I use your content in my own projects?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our content is protected by copyright. For educational use or limited excerpts, see our Media Usage Policy. For commercial use or substantial portions, contact us for permission."
        }
      },
      {
        "@type": "Question",
        name: "Do you have a mobile app?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Not yet. However, our website is a Progressive Web App (PWA), allowing you to install it on your phone or desktop for an app-like experience, including offline access."
        }
      },
      {
        "@type": "Question",
        name: "Do you create original anime?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "While we primarily focus on anime analysis, reviews, and educational content, we also produce short-form original animations. Our long-term goal is to release full-length original anime series, and we're actively working toward that vision."
        }
      },
      {
        "@type": "Question",
        name: "Where can I find all your content?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can explore our content on our website, YouTube channel, and social media platforms. For the most organized and up-to-date collection—including blogs, videos, and interactive features—this website is your best destination."
        }
      },
      {
        "@type": "Question",
        name: "How long does it take to get a response?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We typically respond to all inquiries within 24 to 48 hours on business days. For urgent matters, please mention it in the subject line."
        }
      },
      {
        "@type": "Question",
        name: "Do you accept guest blog posts or collaborations?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! We occasionally feature guest writers and collaborate with fellow creators. Please reach out through our Contact Page with your proposal and work samples."
        }
      },
      {
        "@type": "Question",
        name: "Can I visit Flavor Studios in person?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We're a digital-first studio and do not currently offer in-person visits."
        }
      },
      {
        "@type": "Question",
        name: "How can I report a technical issue with the website?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Use the contact form, select 'Support,' and describe your issue. Screenshots and browser/device info are helpful."
        }
      },
      {
        "@type": "Question",
        name: "Is my payment information secure?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. We use Stripe through Buy Me a Coffee for all transactions, with bank-level encryption. We never store your full payment data."
        }
      },
      {
        "@type": "Question",
        name: "Do I need an account to donate?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No, you can donate directly—no registration required."
        }
      },
      {
        "@type": "Question",
        name: "Where does my donation go?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Your support helps fund animation tools, site hosting, and our original projects like anime production and studio upgrades."
        }
      },
      {
        "@type": "Question",
        name: "Where can I find your legal and privacy policies?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "All policies—including Privacy, Terms, DMCA, and Cookie Policy—are linked in the footer of every page."
        }
      },
      {
        "@type": "Question",
        name: "Do you collect personal data?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Only essential information like your name or email, used solely for communication. See our Privacy Policy for details."
        }
      },
      {
        "@type": "Question",
        name: "How do you handle cookies and trackers?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We use cookies to improve your experience. You can adjust your preferences via the CookieYes banner on our site."
        }
      },
      {
        "@type": "Question",
        name: "How do you select which anime to review?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We review popular releases, classics, and hidden gems—based on team interests, trends, and community requests."
        }
      },
      {
        "@type": "Question",
        name: "The website or video isn't working properly. What should I do?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Refresh your browser or clear your cache. If issues persist, report them via the contact form with full details."
        }
      },
      {
        "@type": "Question",
        name: "How can I be notified of new content?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Subscribe to our newsletter, enable YouTube notifications, or follow us on Instagram, Threads, and X for updates."
        }
      },
      {
        "@type": "Question",
        name: "Is my personal data protected?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. We use modern data security protocols. See our Privacy Policy to understand how your data is collected and used."
        }
      }
      // ... Add more as you expand your FAQ!
    ],
    publisher: {
      "@type": "Organization",
      name: "Flavor Studios",
      url: "https://flavorstudios.in",
      logo: {
        "@type": "ImageObject",
        url: "https://flavorstudios.in/logo.png"
      }
    }
  }
});
