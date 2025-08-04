// components/footer.tsx

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import FollowUs from "@/components/FollowUs";

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
];

const sitemapHref = "/sitemap.xml";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [showMore, setShowMore] = useState(false);

  const companyLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Career", href: "/career" },
    { name: "Contact", href: "/contact" },
  ];

  const discoverLinks = [
    { name: "Blog", href: "/blog" },
    { name: "Watch", href: "/watch" },
    { name: "Play", href: "/play" },
    { name: "FAQ", href: "/faq" },
    { name: "Support", href: "/support" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms-of-service" },
    { name: "DMCA", href: "/dmca" },
    { name: "Cookie Policy", href: "/cookie-policy" },
    { name: "Disclaimer", href: "/disclaimer" },
    { name: "Media Usage Policy", href: "/media-usage-policy" },
  ];

  // App store URLs from env (must be NEXT_PUBLIC_... to work on client)
  const iosAppUrl = process.env.NEXT_PUBLIC_IOS_APP_URL;
  const androidAppUrl = process.env.NEXT_PUBLIC_ANDROID_APP_URL;

  // Only include badges if URLs are set (DRY and future-proof)
  const appBadges = [
    iosAppUrl && {
      label: "App Store",
      href: iosAppUrl,
      imgSrc: "https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg",
    },
    androidAppUrl && {
      label: "Google Play",
      href: androidAppUrl,
      imgSrc: "https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png",
    },
  ].filter(Boolean);

  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto max-w-7xl px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Brand Section */}
          <section aria-labelledby="footer-brand" className="space-y-5">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl">Flavor Studios</span>
            </Link>
            <p
              id="footer-brand"
              className={cn(
                "text-white text-sm leading-relaxed",
                showMore ? "" : "line-clamp-2 lg:line-clamp-none"
              )}
            >
              Crafting stories with soul, one frame at a time. Flavor Studios is a global animation studio dedicated to
              creating meaningful 3D animations and original anime. Through powerful storytelling and emotional depth,
              we aim to inspire, heal, and connect audiences worldwide.
            </p>
            <button
              onClick={() => setShowMore((prev) => !prev)}
              className="text-xs text-gray-400 underline lg:hidden"
              aria-expanded={showMore}
              aria-controls="footer-brand"
              type="button"
            >
              {showMore ? "Less" : "More"}
            </button>
          </section>

          {/* Navigation Section */}
          <section id="footer-navigation" className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <nav aria-label="Company">
              <h3 className="font-semibold text-lg mb-4 text-white">Company</h3>
              <ul className="space-y-3">
                {companyLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-white hover:text-gray-400 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Discover">
              <h3 className="font-semibold text-lg mb-4 text-white">Discover</h3>
              <ul className="space-y-3">
                {discoverLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-white hover:text-gray-400 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Legal">
              <h3 className="font-semibold text-lg mb-4 text-white">Legal</h3>
              <ul className="space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-white hover:text-gray-400 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </section>

          {/* Social + Optional Blocks Section */}
          <section className="space-y-6">
            <FollowUs />
            <div className="space-y-4">
              {appBadges.length > 0 && (
                <div className="flex flex-wrap gap-4">
                  {appBadges.map((badge) => (
                    <Link
                      key={badge.label}
                      href={badge.href}
                      className="focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded"
                    >
                      <img
                        src={badge.imgSrc}
                        alt={badge.label}
                        className="h-10 w-auto"
                      />
                    </Link>
                  ))}
                </div>
              )}
              {sitemapHref && (
                <div>
                  <Link
                    href={sitemapHref}
                    className="text-sm text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                  >
                    Sitemap
                  </Link>
                </div>
              )}
            </div>
          </section>
        </div>
        <div className="border-t border-white mt-8 pt-6 text-center space-y-2">
          <p className="text-white text-sm">© {currentYear} Flavor Studios. All rights reserved.</p>
          <p className="text-white text-xs">Built with Passion. Powered by Dreams.</p>
          {/* Single Language selector, bottom only */}
          <div>
            <label htmlFor="language" className="sr-only">
              Language
            </label>
            <select
              id="language"
              className="bg-black border border-gray-700 rounded-md px-3 py-2 text-sm"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </footer>
  );
}
