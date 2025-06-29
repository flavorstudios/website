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
  <div data-style="full" style="--bg-border-radius: 5px;">
    <div data-element="column" class="formkit-column">
      <div class="formkit-header" data-element="header" style="color: rgb(61, 61, 61); font-weight: 700;">
        <h2>Don’t Miss the Next Big Thing in Anime!</h2>
      </div>
      <div class="formkit-content" data-element="content" style="color: rgb(110, 110, 110);">
        <p>Become part of the Flavor Studios community. Get breaking news, special content, early access to our latest projects, plus fresh anime updates, life lessons, and original stories delivered right to your inbox. Join now. Adventure awaits!<br>​<br>Sign up and get fresh anime updates, life lessons, and original stories delivered right to your inbox.</p>
      </div>
      <ul class="formkit-alert formkit-alert-error" data-element="errors" data-group="alert"></ul>
      <div data-element="fields" data-stacked="true" class="seva-fields formkit-fields">
        <div class="formkit-field">
          <input class="formkit-input" aria-label="First Name" name="fields[first_name]" required placeholder="First Name" type="text" style="color: rgb(110, 110, 110); background-color: rgb(247, 247, 247); border-radius: 5px; font-weight: 400;">
        </div>
        <div class="formkit-field">
          <input class="formkit-input" aria-label="Last Name" name="fields[first_name]" required placeholder="Last Name" type="text" style="color: rgb(110, 110, 110); background-color: rgb(247, 247, 247); border-radius: 5px; font-weight: 400;">
        </div>
        <div class="formkit-field">
          <input class="formkit-input" name="email_address" aria-label="Email Address" placeholder="Email Address" required type="email" style="color: rgb(110, 110, 110); background-color: rgb(247, 247, 247); border-radius: 5px; font-weight: 400;">
        </div>
        <button data-element="submit" class="formkit-submit formkit-submit" style="color: rgb(255, 255, 255); background-color: rgb(120, 94, 223); border-radius: 5px; font-weight: 700;">
          <div class="formkit-spinner"><div></div><div></div><div></div></div>
          <span class="">Subscribe Now</span>
        </button>
      </div>
      <div class="formkit-disclaimer" data-element="disclaimer" style="color: rgb(110, 110, 110);">
        <p>We respect your <a href="https://flavorstudios.in/privacy-policy" target="_blank" rel="noopener noreferrer">privacy</a>. Unsubscribe at any time.</p>
      </div>
      <div class="formkit-powered-by-convertkit-container">
        <a href="https://kit.com/features/forms?utm_campaign=poweredby&amp;utm_content=form&amp;utm_medium=referral&amp;utm_source=dynamic" data-element="powered-by" class="formkit-powered-by-convertkit" data-variant="dark" target="_blank" rel="nofollow">Built with Kit</a>
      </div>
    </div>
    <div data-element="column" class="formkit-background"></div>
  </div>
  <style>
    /* -- Paste all the provided form CSS styles here -- */
    .formkit-form[data-uid="e3d454ca41"] *{box-sizing:border-box;} /* ...truncated for brevity, use your full style string... */
    /* Add the rest of your long <style> block here */
  </style>
</form>
          `,
        }}
      />
    </>
  );
}
