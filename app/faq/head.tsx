export default function Head() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "name": "Flavor Studios FAQ",
            "url": "https://flavorstudios.in/faq",
            "description":
              "Find answers to common questions about Flavor Studios, animation, support, and our creative process.",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is Flavor Studios?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Flavor Studios is a creative studio focused on producing high-quality anime-inspired content. We craft original videos, blog posts, and interactive experiences designed for anime fans across the globe.",
                },
              },
              // ... Add all other FAQ entries here
              {
                "@type": "Question",
                "name": "Is my personal data protected?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. We use modern data security protocols. See our Privacy Policy to understand how your data is collected and used.",
                },
              },
            ],
            "publisher": {
              "@type": "Organization",
              "name": "Flavor Studios",
              "url": "https://flavorstudios.in",
              "logo": {
                "@type": "ImageObject",
                "url": "https://flavorstudios.in/logo.png",
              },
            },
          }),
        }}
      />
    </>
  );
}
