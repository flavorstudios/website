"use client";

// components/footer.tsx

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { cn } from "@/lib/utils";
import SocialLinks from "@/components/SocialLinks";
import { locales } from "@/i18n";
import { useTranslations } from "@/lib/i18n";

// Human-friendly language labels (expand as needed)
const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  es: "Español",
  hi: "हिन्दी",
  fr: "Français",
  ar: "العربية",
  zh: "中文",
  ja: "日本語",
  de: "Deutsch",
  ru: "Русский",
  pt: "Português",
};

// Generate dropdown options from your centralized locales
const languages = locales.map((code) => ({
  value: code,
  label: LANGUAGE_LABELS[code] ?? code,
}));
const SUPPORTED_LOCALES = Array.from(locales);

const sitemapHref = "/sitemap.xml";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [showMore, setShowMore] = useState(false);

  const t = useTranslations("footer");

  const router = useRouter();
  const pathname = usePathname();

  // Detect current locale from path (default 'en')
  const currentLocale = (() => {
    const parts = pathname.split("/");
    return SUPPORTED_LOCALES.includes(parts[1]) ? parts[1] : "en";
  })();

  // i18n-enabled navigation links
  const companyLinks = [
    { key: "home", href: "/" },
    { key: "about", href: "/about" },
    { key: "career", href: "/career" },
    { key: "contact", href: "/contact" },
  ];
  const discoverLinks = [
    { key: "blog", href: "/blog" },
    { key: "watch", href: "/watch" },
    { key: "play", href: "/play" },
    { key: "faq", href: "/faq" },
    { key: "support", href: "/support" },
  ];
  const legalLinks = [
    { key: "privacyPolicy", href: "/privacy-policy" },
    { key: "termsOfService", href: "/terms-of-service" },
    { key: "dmca", href: "/dmca" },
    { key: "cookiePolicy", href: "/cookie-policy" },
    { key: "disclaimer", href: "/disclaimer" },
    { key: "mediaUsagePolicy", href: "/media-usage-policy" },
  ];

  const iosAppUrl = process.env.NEXT_PUBLIC_IOS_APP_URL;
  const androidAppUrl = process.env.NEXT_PUBLIC_ANDROID_APP_URL;

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

  // LANGUAGE HANDLER: Sets NEXT_LOCALE cookie, localStorage, removes old cookie, and navigates
  function handleLanguageChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selected = e.target.value;
    Cookies.set("NEXT_LOCALE", selected, { expires: 365, path: "/" });
    try {
      localStorage.setItem("NEXT_LOCALE", selected);
    } catch {}
    Cookies.remove("lang");

    // Remove old locale from path if present
    const parts = pathname.split("/");
    let rest = pathname;
    if (SUPPORTED_LOCALES.includes(parts[1])) {
      rest = "/" + parts.slice(2).join("/");
      if (rest === "/") rest = "";
    }
    const newPath = `/${selected}${rest}`;
    router.push(newPath);
  }

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
              {t("brandDescription")}
            </p>
            <button
              onClick={() => setShowMore((prev) => !prev)}
              className="text-xs text-gray-400 underline lg:hidden"
              aria-expanded={showMore}
              aria-controls="footer-brand"
              type="button"
            >
              {showMore ? t("less") : t("more")}
            </button>
          </section>

          {/* Navigation Section */}
          <section id="footer-navigation" className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <nav aria-label={t("company")}>
              <h3 className="font-semibold text-lg mb-4 text-white">{t("company")}</h3>
              <ul className="space-y-3">
                {companyLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white hover:text-gray-400 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                    >
                      {t(link.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label={t("discover")}>
              <h3 className="font-semibold text-lg mb-4 text-white">{t("discover")}</h3>
              <ul className="space-y-3">
                {discoverLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white hover:text-gray-400 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                    >
                      {t(link.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label={t("legal")}>
              <h3 className="font-semibold text-lg mb-4 text-white">{t("legal")}</h3>
              <ul className="space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white hover:text-gray-400 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                    >
                      {t(link.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </section>

          {/* Social + Optional Blocks Section */}
          <section className="space-y-6">
            {/* Social Links */}
            <section aria-labelledby="follow-us-heading" className="space-y-4">
              <h3 id="follow-us-heading" className="font-semibold text-lg text-white">
                {t("followUs")}
              </h3>
              <SocialLinks />
            </section>
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
                    {t("sitemap")}
                  </Link>
                </div>
              )}
            </div>
          </section>
        </div>
        <div className="border-t border-white mt-8 pt-6 text-center space-y-2">
          <p className="text-white text-sm">{t("copyright", { year: currentYear })}</p>
          <p className="text-white text-xs">{t("tagline")}</p>
          {/* Single Language selector, bottom only */}
          <div>
            <label htmlFor="language-select" className="sr-only">
              {t("language")}
            </label>
            <select
              id="language-select"
              aria-label={t("language")}
              className="bg-black border border-gray-700 rounded-md px-3 py-2 text-sm"
              value={currentLocale}
              onChange={handleLanguageChange}
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
