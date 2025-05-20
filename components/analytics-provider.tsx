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
    try {
      if (pathname && typeof window !== "undefined" && window.gtag) {
        window.gtag("config", "G-7HRYW7Y7YN", {
          page_path: pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ""),
        })
      }
    } catch (error) {
      console.error("Analytics tracking error:", error)
    }
  }, [pathname, searchParams])

  return null
}

export function AnalyticsProvider() {
  return (
    <>
      {/* Google Tag Manager */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        onError={(e) => {
          console.error("Google Tag Manager script error:", e)
        }}
      >
        {`
          try {
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-W7GC5SVZ');
          } catch(e) {
            console.error("GTM initialization error:", e);
          }
        `}
      </Script>
      {/* End Google Tag Manager */}

      {/* Google Analytics (GA4) */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-7HRYW7Y7YN"
        strategy="afterInteractive"
        onError={(e) => {
          console.error("Google Analytics script error:", e)
        }}
      />
      <Script
        id="ga4-analytics"
        strategy="afterInteractive"
        onError={(e) => {
          console.error("GA4 initialization error:", e)
        }}
      >
        {`
          try {
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-7HRYW7Y7YN', {
              page_path: window.location.pathname,
            });
          } catch(e) {
            console.error("GA4 initialization error:", e);
          }
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
