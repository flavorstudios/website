'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';

const COOKIE_YES_ID = process.env.NEXT_PUBLIC_COOKIEYES_ID;

export default function CookieConsent() {
  const pathname = usePathname();

  if (!COOKIE_YES_ID || pathname.startsWith('/admin')) return null;

  return (
    <Script
      id="cookieyes-script"
      strategy="afterInteractive"
      src={`https://cdn-cookieyes.com/client_data/${COOKIE_YES_ID}/script.js`}
    />
  );
}