// components/footer.tsx

import { useState } from "react";
import Link from "next/link";
import SocialIcons, { defaultPlatforms as followLinks } from "@/components/SocialIcons";
import { cn } from "@/lib/utils";

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

  // Optional blocks (future expansion ready)
  const languages = [
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
  ];
  const appBadges = [
    {
      label: "App Store",
      href: "#",
      imgSrc: "https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg",
    },
    {
      label: "Google Play",
      href: "#",
      imgSrc: "https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png",
    },
  ];
  const sitemapHref = "/sitemap.xml";

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
          <section>
            <nav aria-label="Footer Navigation" className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold text-lg mb-4 text-white">Company</h3>
                <ul className="space-y-3">
                  {companyLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-white hover:text-gray-400 transition-colors text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-4 text-white">Discover</h3>
                <ul className="space-y-3">
                  {discoverLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-white hover:text-gray-400 transition-colors text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-4 text-white">Legal</h3>
                <ul className="space-y-3">
                  {legalLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-white hover:text-gray-400 transition-colors text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </section>

          {/* Social + Optional Blocks Section */}
          <section className="space-y-6">
            <h3 className="font-semibold text-lg text-white">Follow us</h3>
            <SocialIcons className="gap-4" variant="color" platforms={followLinks} />
            <div className="space-y-4">
              {languages.length > 0 && (
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
              )}
              {appBadges.length > 0 && (
                <div className="flex flex-wrap gap-4">
                  {appBadges.map((badge) => (
                    <Link key={badge.label} href={badge.href}>
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
                    className="text-sm text-gray-400 hover:text-white"
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
        </div>
      </div>
    </footer>
  );
}
