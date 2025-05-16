"use client"

import Script from "next/script"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { Suspense } from "react"

// Separate the analytics tracking into its own component
function AnalyticsTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Track page views when route changes
  useEffect(() => {
    if (pathname && window.gtag) {
      window.gtag("config", "G-7HRYW7Y7YN", {
        page_path: pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ""),
      })
    }
  }, [pathname, searchParams])

  return null
}

export function AnalyticsProvider() {
  return (
    <>
      {/* Google Tag Manager */}
      <Script id="gtm-script" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-W7GC5SVZ');
        `}
      </Script>
      {/* End Google Tag Manager */}

      {/* Google Analytics (GA4) */}
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-7HRYW7Y7YN" strategy="afterInteractive" />
      <Script id="ga4-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-7HRYW7Y7YN', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
      {/* End Google Analytics */}

      {/* Wrap the analytics tracker in Suspense */}
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
    </>
  )
}
