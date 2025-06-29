"use client";

import Script from "next/script";

export default function ConvertKitPopup() {
  return (
    <>
      {/* Load ConvertKit’s script once per page */}
      <Script
        src="https://f.convertkit.com/ckjs/ck.5.js"
        strategy="afterInteractive"
      />

      {/* Render the full ConvertKit form markup exactly as provided */}
      <div
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: `
<form action="https://app.kit.com/forms/8247464/subscriptions" class="seva-form formkit-form" method="post" data-sv-form="8247464" data-uid="e3d454ca41" data-format="modal" data-version="5" data-options="{&quot;settings&quot;:{&quot;after_subscribe&quot;:{&quot;action&quot;:&quot;message&quot;,&quot;success_message&quot;:&quot;You’re in! Check your inbox to confirm your subscription and start your journey with Flavor Studios. Welcome to the anime side!&quot;,&quot;redirect_url&quot;:&quot;&quot;},&quot;analytics&quot;:{&quot;google&quot;:null,&quot;fathom&quot;:null,&quot;facebook&quot;:null,&quot;segment&quot;:null,&quot;pinterest&quot;:null,&quot;sparkloop&quot;:null,&quot;googletagmanager&quot;:null},&quot;modal&quot;:{&quot;trigger&quot;:&quot;timer&quot;,&quot;scroll_percentage&quot;:null,&quot;timer&quot;:&quot;5&quot;,&quot;devices&quot;:&quot;all&quot;,&quot;show_once_every&quot;:&quot;0&quot;},&quot;powered_by&quot;:{&quot;show&quot;:true,&quot;url&quot;:&quot;https://kit.com/features/forms?utm_campaign=poweredby&amp;utm_content=form&amp;utm_medium=referral&amp;utm_source=dynamic&quot;},&quot;recaptcha&quot;:{&quot;enabled&quot;:true},&quot;return_visitor&quot;:{&quot;action&quot;:&quot;show&quot;,&quot;custom_content&quot;:&quot;&quot;},&quot;slide_in&quot;:{&quot;display_in&quot;:&quot;bottom_right&quot;,&quot;trigger&quot;:&quot;timer&quot;,&quot;scroll_percentage&quot;:null,&quot;timer&quot;:5,&quot;devices&quot;:&quot;all&quot;,&quot;show_once_every&quot;:15},&quot;sticky_bar&quot;:{&quot;display_in&quot;:&quot;top&quot;,&quot;trigger&quot;:&quot;timer&quot;,&quot;scroll_percentage&quot;:null,&quot;timer&quot;:5,&quot;devices&quot;:&quot;all&quot;,&quot;show_once_every&quot;:15}},&quot;version&quot;:&quot;5&quot;}" min-width="400 500 600 700 800" style="background-color: rgb(255, 255, 255); border-radius: 10px;">
  <!-- ...the rest of your form code here... -->
</form>
          `,
        }}
      ></div>
    </>
  );
}
