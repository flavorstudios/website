import Image from "next/image"
import Link from "next/link"

import { StructuredData } from "@/components/StructuredData"
import { Hero } from "./components/Hero"
import { SectionBlock } from "./components/SectionBlock"
import { Carousel, type CarouselItem } from "./components/Carousel"

import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants"
import { getMetadata } from "@/lib/seo/metadata"
import { getSchema } from "@/lib/seo/schema"

const heroContent = {
  title: "Discover the Universes of Flavor Studios",
  subtitle: "ORIGINAL ANIME STORIES",
  description:
    "Dive into exclusive premieres, behind-the-scenes documentaries, and community-driven events that celebrate anime artistry across the globe.",
  ctaLabel: "Start Watching",
  ctaHref: "/watch",
  secondaryCtaLabel: "Join the Community",
  secondaryCtaHref: "/support",
  backgroundVideo: "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4",
  posterImage: "/cover.jpg",
  featuredImage: "/home/feature-spotlight.svg",
}

const spotlightCarousels: CarouselItem[] = [
  {
    id: "spotlight-aurora",
    title: "Aurora Protocol: Episode 01",
    description: "A rebel pilot unlocks a quantum symphony set to reshape the colonies.",
    image: "/home/feature-card-1.svg",
    href: "/watch?feature=aurora-protocol",
    meta: "Premiere",
  },
  {
    id: "spotlight-ember",
    title: "Emberwrights Documentary",
    description: "Meet the creators forging real fire magic for our latest live-action hybrid.",
    image: "/home/feature-card-2.svg",
    href: "/blog/emberwrights-documentary",
    meta: "Original",
  },
  {
    id: "spotlight-odyssey",
    title: "Skyline Odyssey Chapter 7",
    description: "Faye navigates the neon underworld in this weeks cyber-noir installment.",
    image: "/home/feature-card-3.svg",
    href: "/watch?feature=skyline-odyssey",
    meta: "New",
  },
  {
    id: "spotlight-festival",
    title: "Behind the Mic: Celestial Ballads",
    description: "Voice actors improvise ballads live from the Flavor Tokyo Studio.",
    image: "/home/feature-card-4.svg",
    href: "/blog/celestial-ballads",
    meta: "Exclusive",
  },
  {
    id: "spotlight-tournament",
    title: "Starlight Circuit Tournament",
    description: "Top animators square off in a realtime character design showdown.",
    image: "/home/feature-card-5.svg",
    href: "/play/starlight-circuit",
    meta: "Event",
  },
]

const trendingWorlds = [
  {
    id: "world-solstice",
    title: "Solstice Vanguard",
    description: "Solar knights defend a city that never sleeps.",
    image: "/home/feature-card-2.svg",
    href: "/watch?world=solstice-vanguard",
  },
  {
    id: "world-abyss",
    title: "Abyss Echo",
    description: "Mystic divers map dreams below the ocean floor.",
    image: "/home/feature-card-3.svg",
    href: "/watch?world=abyss-echo",
  },
  {
    id: "world-nexus",
    title: "Chromatic Nexus",
    description: "Digital spirits rewrite the skyline every midnight.",
    image: "/home/feature-card-4.svg",
    href: "/watch?world=chromatic-nexus",
  },
  {
    id: "world-chronicle",
    title: "Chronicle of Ash",
    description: "Warriors tame elemental storms across ancient sky temples.",
    image: "/home/feature-card-5.svg",
    href: "/watch?world=chronicle-of-ash",
  },
]

const behindTheScenes = [
  {
    id: "bts-mocap",
    title: "Motion Capture Lab Tour",
    excerpt: "Go inside our holo-stage as performers drive the action of Aurora Protocol.",
  },
  {
    id: "bts-score",
    title: "Scoring with Synth Alchemists",
    excerpt: "Our composers remix analog warmth with cosmic ambience for Skyline Odyssey.",
  },
  {
    id: "bts-story",
    title: "Writers Room: Mapping Multiverses",
    excerpt: "Flavor Studios storytellers break down how a single sketch evolves into a saga.",
  },
]

const liveEvents = [
  {
    id: "event-1",
    title: "Flavor Fan Fest - Los Angeles",
    date: "March 28, 2025",
    location: "LA Convention Center",
    description: "Premiere screenings, cosplay parades, and interactive VR suites.",
  },
  {
    id: "event-2",
    title: "Storyboarding Masterclass",
    date: "April 12, 2025",
    location: "Online + Global",
    description: "Livestream workshop with senior artists plus downloadable workbooks.",
  },
  {
    id: "event-3",
    title: "Studio Night Market",
    date: "May 9, 2025",
    location: "Flavor Studios Tokyo",
    description: "Meet the team, screen secret pilots, and enjoy street-food pairings.",
  },
]

export const metadata = getMetadata({
  title: `${SITE_NAME} | Streaming the Future of Anime Fandom`,
  description: SITE_DESCRIPTION,
  path: "/",
  robots: "index,follow",
  openGraph: {
    title: `${SITE_NAME} | Streaming the Future of Anime Fandom`,
    description: SITE_DESCRIPTION,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/cover.jpg`,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    title: `${SITE_NAME} | Streaming the Future of Anime Fandom`,
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/cover.jpg`],
  },
})

const structuredData = getSchema({
  type: "CollectionPage",
  path: "/",
  title: `${SITE_NAME} Home`,
  description: SITE_DESCRIPTION,
  image: `${SITE_URL}/cover.jpg`,
  hasPart: spotlightCarousels.map((item, index) => ({
    "@type": "CreativeWork",
    name: item.title,
    position: index + 1,
    url: `${SITE_URL}${item.href}`,
    description: item.description,
  })),
})

export default function HomePage() {
  return (
    <div className="flex flex-col gap-0 bg-slate-950 text-white">
      <StructuredData schema={structuredData} />

      <Hero {...heroContent} />

      <SectionBlock
        id="premieres"
        eyebrow="Weekly premieres"
        title="Fresh stories drop every Friday"
        description="Stay ahead with cinematic-length episodes, interactive comics, and immersive audio dramas crafted by the Flavor Studios collective."
        background="dark"
      >
        <Carousel
          items={spotlightCarousels}
          ariaLabel="Flavor Studios spotlight carousel"
          className="mt-12"
        />
      </SectionBlock>

      <SectionBlock
        id="worlds"
        eyebrow="Explore the worlds"
        title="Choose your next obsession"
        description="Every universe comes alive with animated shorts, lore galleries, and community forums to dive deeper than ever."
        background="gradient"
      >
        <div className="-mx-4 flex gap-6 overflow-x-auto px-4 pb-4 pt-2 scroll-smooth" role="list">
          {trendingWorlds.map((world) => (
              <article
                key={world.id}
                role="listitem"
                className="group relative h-[360px] w-[280px] shrink-0 overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900/60 text-left shadow-xl transition-transform duration-500 hover:-translate-y-3 hover:shadow-2xl sm:h-[400px] sm:w-[320px]"
              >
                <div className="absolute inset-0">
                  <Image
                    src={world.image}
                    alt={world.title}
                    fill
                    sizes="(max-width: 768px) 70vw, 320px"
                    className="object-cover opacity-80 transition duration-500 group-hover:opacity-100"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />
                <div className="relative flex h-full flex-col justify-end gap-3 p-6">
                  <h3 className="text-2xl font-semibold leading-tight">{world.title}</h3>
                  <p className="text-sm text-slate-200/80">{world.description}</p>
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Enter world</span>
                </div>
                <Link href={world.href} className="absolute inset-0" aria-label={`View details for ${world.title}`}>
                  <span className="sr-only">View details for {world.title}</span>
                </Link>
              </article>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock
        id="behind-the-scenes"
        eyebrow="Behind the scenes"
        title="Crafted by artists who live the stories"
        description="Meet the teams, explore toolkits, and learn how every character, beat, and crescendo takes shape inside Flavor Studios."
        background="dark"
      >
        <div className="grid gap-8 md:grid-cols-3">
          {behindTheScenes.map((feature) => (
            <article
              key={feature.id}
              className="flex h-full flex-col rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-lg transition duration-500 hover:-translate-y-2 hover:border-white/30"
            >
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="mt-4 text-sm text-slate-300">{feature.excerpt}</p>
              <span className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Read feature</span>
            </article>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock
        id="events"
        eyebrow="Live & interactive"
        title="Events that bring the fandom together"
        description="From studio tours to virtual premieres, every month is packed with experiences designed for superfans."
        background="light"
        align="center"
      >
        <div className="mx-auto max-w-4xl space-y-6">
          {liveEvents.map((event) => (
            <article
              key={event.id}
              className="flex flex-col gap-3 rounded-3xl border border-slate-200/70 bg-white/90 p-6 text-slate-900 shadow-md transition duration-500 hover:-translate-y-1 hover:shadow-xl md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">{event.date}</p>
                <h3 className="mt-2 text-xl font-semibold">{event.title}</h3>
                <p className="text-sm text-slate-600">{event.description}</p>
              </div>
              <div className="text-sm font-semibold text-slate-700 md:text-right">
                <p>{event.location}</p>
                <a
                  href="/support"
                  className="mt-2 inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-xs uppercase tracking-[0.25em] text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  RSVP
                </a>
              </div>
            </article>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock
        id="newsletter"
        eyebrow="Stay in sync"
        title="Get weekend drop alerts"
        description="Subscribe for release roundups, digital art drops, and member-only screening invites."
        background="gradient"
        align="center"
      >
        <form className="mx-auto flex w-full max-w-xl flex-col gap-4 rounded-3xl border border-white/20 bg-slate-900/60 p-6 shadow-2xl backdrop-blur">
          <label htmlFor="newsletter-email" className="text-left text-sm font-medium text-slate-200">
            Email address
          </label>
          <input
            id="newsletter-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            className="w-full rounded-full border border-white/20 bg-black/40 px-5 py-3 text-sm text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
            aria-label="Email address"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-900 transition hover:bg-slate-200"
          >
            Subscribe
          </button>
          <p className="text-left text-xs text-slate-300/80">
            We respect your inbox. Expect a curated drop every Friday with new releases and event passes.
          </p>
        </form>
      </SectionBlock>
    </div>
  )
}