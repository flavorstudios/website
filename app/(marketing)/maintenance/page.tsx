// app/maintenance/page.tsx

import type { Metadata } from 'next';
import MaintenancePageClient from './MaintenancePageClient';

// === SEO & Metadata ===
export const metadata: Metadata = {
  title: 'Under Maintenance – Flavor Studios',
  description:
    "Our website is currently under scheduled maintenance. We'll be back soon with new features and improvements. Stay tuned with Flavor Studios!",
  robots: { index: false, follow: true },
  alternates: {
    canonical: 'https://flavorstudios.in/maintenance',
  },
  openGraph: {
    title: 'Under Maintenance – Flavor Studios',
    description:
      "Our website is currently under scheduled maintenance. We'll be back soon with new features and improvements.",
    type: 'website',
    url: 'https://flavorstudios.in/maintenance',
    siteName: 'Flavor Studios',
    images: [
      {
        url: 'https://flavorstudios.in/cover.jpg',
        width: 1200,
        height: 630,
        alt: 'Under Maintenance – Flavor Studios',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@flavorstudios',
    title: 'Under Maintenance – Flavor Studios',
    description:
      "Our website is currently under scheduled maintenance. We'll be back soon with new features and improvements.",
    images: ['https://flavorstudios.in/cover.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  metadataBase: new URL('https://flavorstudios.in'),
};

// JSON-LD Schema
function JsonLdSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://flavorstudios.in/maintenance',
    url: 'https://flavorstudios.in/maintenance',
    name: 'Under Maintenance – Flavor Studios',
    description:
      "Our website is currently under scheduled maintenance. We'll be back soon with new features and improvements. Stay tuned with Flavor Studios!",
  };
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function MaintenancePage() {
  return (
    <>
      <JsonLdSchema />
      <MaintenancePageClient />
    </>
  );
}