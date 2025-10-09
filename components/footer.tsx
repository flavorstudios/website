"use client"

import Link from "next/link"
import { useCallback } from "react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const primaryLinks = [
    { name: "About Flavor Studios", href: "/about" },
    { name: "Watch", href: "/watch" },
    { name: "Play", href: "/play" },
    { name: "Blog", href: "/blog" },
    { name: "Support", href: "/support" },
  ]

  const socialLinks = [
    { name: "YouTube", href: "https://www.youtube.com/@flavorstudios" },
    { name: "Facebook", href: "https://www.facebook.com/flavourstudios" },
    { name: "Instagram", href: "https://www.instagram.com/flavorstudios" },
    { name: "Twitter", href: "https://twitter.com/flavor_studios" },
    { name: "Discord", href: "https://discord.com/channels/@flavorstudios" },
    { name: "Telegram", href: "https://t.me/flavorstudios" },
    { name: "Threads", href: "https://www.threads.net/@flavorstudios" },
    { name: "Reddit", href: "https://www.reddit.com/r/flavorstudios/" },
  ]

  const legalRowLinks = [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms-of-service" },
    { name: "Cookie Policy", href: "/cookie-policy" },
    { name: "DMCA", href: "/dmca" },
    { name: "Disclaimer", href: "/disclaimer" },
    { name: "Usage Policy", href: "/media-usage-policy", ariaLabel: "Usage Policy" },
  ]

  const handleBackToTop = useCallback(() => {
    const target = document.getElementById("top")

    if (target) {
      target.scrollIntoView({ behavior: "smooth" })
      return
    }

    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  return (
    <div className="relative overflow-hidden bg-black text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-32 h-[14rem] bg-white"
        style={{
          clipPath: "ellipse(88% 100% at 50% 0%)",
          boxShadow: "0 36px 110px rgba(0,0,0,0.3)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(circle at 50% -20%, rgba(229, 9, 20, 0.45), rgba(0, 0, 0, 0) 64%)",
          opacity: 0.8,
        }}
      />
      <div className="relative z-10 mx-auto flex w-full max-w-[1100px] flex-col items-center gap-9 px-6 pb-12 pt-28 text-center md:px-10 lg:px-12">
        <button
          type="button"
          onClick={handleBackToTop}
          className="inline-flex items-center gap-2 rounded-full bg-[#e50914] px-8 py-2.5 text-xs font-semibold uppercase tracking-[0.38em] transition duration-200 hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          aria-label="Back to top"
        >
          <span aria-hidden="true" className="text-base leading-none">
            ↑
          </span>
          Back To Top
        </button>

        <div className="flex flex-col items-center gap-7">
          <div className="flex flex-col items-center gap-2.5">
            <span className="rounded-full border border-white/15 px-3.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.5em] text-white/70">
              Flavor Studios Presents
            </span>
            <div className="text-[clamp(3rem,7vw,4.75rem)] font-black uppercase tracking-[0.24em]">
              Flavor Studios
            </div>
            <p className="max-w-2xl text-sm font-medium uppercase tracking-[0.38em] text-white/70">
              Original animation & immersive storytelling
            </p>
            <p className="max-w-2xl text-[clamp(0.9rem,1.6vw,1.05rem)] leading-relaxed text-white/75">
              Creating meaningful 3D animations and original anime that connect audiences across the globe. Every project is
              crafted with heart, purpose, and a love for imagination.
            </p>
          </div>

          <nav aria-label="Footer primary navigation" className="w-full max-w-[320px]">
            <ul className="flex flex-col gap-3 text-center">
              {primaryLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="block rounded-full bg-white/5 px-5 py-2.5 text-[clamp(0.9rem,1.9vw,1.1rem)] font-semibold uppercase tracking-[0.28em] text-white transition duration-200 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <ul className="flex flex-wrap items-center justify-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white/80" aria-label="Social media">
            {socialLinks.map((social) => (
              <li key={social.name}>
                <Link
                  href={social.href}
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.28em] text-black transition duration-200 hover:translate-y-[-2px] hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 w-full border-t border-white/10 pt-6">
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[clamp(0.68rem,1vw,0.85rem)] text-white/60" aria-label="Legal">
            {legalRowLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  aria-label={link.ariaLabel}
                  className="transition duration-200 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[clamp(0.68rem,1vw,0.85rem)] text-white/60">© {currentYear} Flavor Studios. All rights reserved.</p>
          <p className="text-[clamp(0.68rem,1vw,0.85rem)] text-white/60">Built with passion. Powered by dreams.</p>
        </div>
      </div>
    </div>
  )
}