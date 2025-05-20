"use client"

import Script from "next/script"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

export function FacebookPixel() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Track page views when route changes
  useEffect(() => {
    try {
      if (pathname && typeof window !== "undefined" && window.fbq) {
        window.fbq("track", "PageView")
      }
    } catch (error) {
      console.error("Facebook Pixel tracking error:", error)
    }
  }, [pathname, searchParams])

  return (
    <>
      {/* Facebook Pixel Code */}
      <Script
        id="facebook-pixel"
        strategy="afterInteractive"
        onError={(e) => {
          console.error("Facebook Pixel script error:", e)
        }}
      >
        {`
          try {
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1748435792042486');
            fbq('track', 'PageView');
          } catch(e) {
            console.error("Facebook Pixel initialization error:", e);
          }
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src="https://www.facebook.com/tr?id=1748435792042486&ev=PageView&noscript=1"
          alt=""
        />
      </noscript>
      {/* End Facebook Pixel Code */}
    </>
  )
}
