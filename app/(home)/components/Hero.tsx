"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

interface HeroProps {
  title: string
  subtitle: string
  description: string
  ctaLabel: string
  ctaHref: string
  secondaryCtaLabel: string
  secondaryCtaHref: string
  backgroundVideo: string
  posterImage: string
  featuredImage: string
}

export function Hero({
  title,
  subtitle,
  description,
  ctaLabel,
  ctaHref,
  secondaryCtaHref,
  secondaryCtaLabel,
  backgroundVideo,
  posterImage,
  featuredImage,
}: HeroProps) {
  return (
    <section className="relative isolate min-h-[85vh] w-full overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full">
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={posterImage}
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-background" />
      </div>

      <div className="relative mx-auto flex min-h-[85vh] w-full max-w-7xl flex-col justify-center gap-10 px-4 py-24 text-white md:flex-row md:items-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl space-y-6"
        >
          <p className="text-sm uppercase tracking-[0.4em] text-slate-200">{subtitle}</p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">{title}</h1>
          <p className="text-lg text-slate-100/90 md:text-xl">{description}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={ctaHref}
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-wide text-black transition hover:bg-slate-200"
            >
              {ctaLabel}
            </Link>
            <Link
              href={secondaryCtaHref}
              className="rounded-full border border-white/70 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:border-white hover:bg-white/10"
            >
              {secondaryCtaLabel}
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="relative hidden max-w-sm shrink-0 overflow-hidden rounded-3xl border border-white/20 shadow-xl md:block"
        >
          <Image
            src={featuredImage}
            alt="Key visual for our latest Flavor Studios project"
            width={480}
            height={640}
            className="h-full w-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </motion.div>
      </div>
    </section>
  )
}