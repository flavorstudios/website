// app/layout.tsx

import type React from "react";
import "./globals.css";
import "./fonts/poppins.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BackToTop } from "@/components/back-to-top";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ fontFamily: "var(--font-poppins)" }}>
      <body className="antialiased">
        {/* === GTM (NOSCRIPT) === */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WMTGR7NM"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="GTM"
          />
        </noscript>
        {/* === END GTM (NOSCRIPT) === */}

        <Header />
        <main>{children}</main>
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
