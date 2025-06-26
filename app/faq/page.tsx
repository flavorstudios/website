// app/faq/page.tsx (Inside FAQPage component or as a separate schema function)
// Assume faqQuestions is an array like [{ question: "...", answer: "..." }]
const faqQuestions = [
    { question: "What is Flavor Studios?", answer: "Flavor Studios is an indie animation studio..." },
    // ... more FAQs
];

const faqSchema = getSchema({
    type: "FAQPage",
    path: "/faq",
    title: `${SITE_NAME} FAQ – Anime & Support Help`,
    description: `Get answers to frequently asked questions...`,
    image: SITE_LOGO_URL,
    publisher: {
        name: SITE_NAME,
        logo: SITE_LOGO_URL,
    },
    // This is the key part for FAQPage schema
    mainEntity: faqQuestions.map(item => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
        },
    })),
});

return (
    <>
        <StructuredData schema={faqSchema} />
        <FaqPageClient faqData={faqQuestions} /> {/* Pass data to client component */}
    </>
);
