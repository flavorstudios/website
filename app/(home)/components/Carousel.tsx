"use client"

import type { ReactNode } from "react"
import { useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface CarouselItem {
  id: string
  title: string
  description?: string
  image: string
  href: string
  meta?: string
}

interface CarouselProps {
  items: CarouselItem[]
  ariaLabel: string
  className?: string
  renderFooter?: (item: CarouselItem) => ReactNode
}

export function Carousel({ items, ariaLabel, className, renderFooter }: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", skipSnaps: false })

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <div className={cn("relative", className)}>
      <div className="overflow-hidden" ref={emblaRef} aria-label={ariaLabel}>
        <div className="flex gap-6">
          {items.map((item) => (
            <article
              key={item.id}
              className="relative flex min-h-[320px] min-w-[240px] max-w-[260px] flex-col overflow-hidden rounded-3xl bg-slate-900/60 text-white shadow-2xl ring-1 ring-white/10 transition-transform duration-500 hover:-translate-y-2 hover:ring-white/30 sm:min-w-[300px] sm:max-w-[320px]"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 80vw, 320px"
                  className="object-cover"
                />
                {item.meta && (
                  <span className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                    {item.meta}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-3 p-6">
                <h3 className="text-lg font-semibold leading-tight">{item.title}</h3>
                {item.description && <p className="text-sm text-slate-200/80">{item.description}</p>}
                <div className="mt-auto text-sm font-semibold uppercase tracking-widest text-sky-300">
                  Discover more →
                </div>
              </div>
              {renderFooter && <div className="border-t border-white/10 p-4 text-sm">{renderFooter(item)}</div>}
              <Link href={item.href} className="absolute inset-0" aria-label={`Open ${item.title}`}>
                <span className="sr-only">Open {item.title}</span>
              </Link>
            </article>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute -top-20 right-4 flex gap-2 sm:-top-24">
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={scrollPrev}
          className="pointer-events-auto rounded-full border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/30"
          aria-label="Scroll carousel backward"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={scrollNext}
          className="pointer-events-auto rounded-full border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/30"
          aria-label="Scroll carousel forward"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}