export default function GTMNoScript() {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `
          <!-- Google Tag Manager (noscript) -->
          <noscript>
            <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-W7GC5SVZ"
              height="0" width="0" style="display:none;visibility:hidden">
            </iframe>
          </noscript>
          <!-- End Google Tag Manager (noscript) -->
        `,
      }}
    />
  );
}
