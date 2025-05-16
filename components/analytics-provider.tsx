"use client"

import Script from "next/script"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

export function AnalyticsProvider() {
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

  return (
    <>
      {/* Google Analytics (GA4) */}
      <Script src={`https://www.googletagmanager.com/gtag/js?id=G-7HRYW7Y7YN`} strategy="afterInteractive" />
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

      {/* Google Tag Manager - Script */}
      <Script id="gtm-script" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-WB8X4ZW7');
        `}
      </Script>
    </>
  )
}
