// app/offline/page.tsx

import type { Metadata } from 'next';
import OfflinePageClient from './OfflinePageClient';

// === SEO & Metadata (Server Side) ===
export const metadata: Metadata = {
  title: 'Offline – Flavor Studios',
  description:
    'You are offline. Please check your internet connection to access the latest anime news, original stories, and games from Flavor Studios.',
  robots: { index: false, follow: true },
  alternates: {
    canonical: 'https://flavorstudios.in/offline',
  },
  openGraph: {
    title: 'Offline – Flavor Studios',
    description:
      'You are offline. Please check your internet connection to access Flavor Studios.',
    type: 'website',
    url: 'https://flavorstudios.in/offline',
    siteName: 'Flavor Studios',
    images: [
      {
        url: 'https://flavorstudios.in/cover.jpg',
        width: 1200,
        height: 630,
        alt: 'Flavor Studios Offline Banner',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@flavorstudios',
    title: 'Offline – Flavor Studios',
    description:
      'You are offline. Please check your internet connection to access Flavor Studios.',
    images: ['https://flavorstudios.in/cover.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  metadataBase: new URL('https://flavorstudios.in'),
};

// --- JSON-LD Schema for Google Rich Results ---
function JsonLdSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://flavorstudios.in/offline',
    url: 'https://flavorstudios.in/offline',
    name: 'Offline – Flavor Studios',
    description:
      'You are offline. Please check your internet connection to access the latest anime news, original stories, and games from Flavor Studios.',
  };
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// --- Server Component: Renders SEO + Client UI ---
export default function OfflinePage() {
  return (
    <>
      <JsonLdSchema />
      <OfflinePageClient />
    </>
  );
}
