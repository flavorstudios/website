"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface SectionBlockProps {
  id?: string
  eyebrow?: string
  title: string
  description?: string
  background?: "light" | "dark" | "gradient"
  align?: "left" | "center"
  children?: ReactNode
}

export function SectionBlock({
  id,
  eyebrow,
  title,
  description,
  background = "light",
  align = "left",
  children,
}: SectionBlockProps) {
  const backgroundClass = {
    light: "bg-white text-slate-900",
    dark: "bg-slate-950 text-white",
    gradient: "bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),_rgba(15,23,42,1))] text-white",
  }[background]

  const descriptionClass =
    background === "light" ? "text-slate-600" : "text-slate-200/90"

  return (
    <section id={id} className={cn("py-20", backgroundClass)}>
      <div className="mx-auto w-full max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn(
            "mx-auto max-w-3xl space-y-4",
            align === "center" && "text-center",
          )}
        >
          {eyebrow && (
            <p className="text-xs uppercase tracking-[0.35em] text-sky-400/90">
              {eyebrow}
            </p>
          )}
          <h2 className="text-3xl font-semibold sm:text-4xl">{title}</h2>
          {description && <p className={cn("text-lg sm:text-xl", descriptionClass)}>{description}</p>}
        </motion.div>

        {children && (
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="mt-12"
          >
            {children}
          </motion.div>
        )}
      </div>
    </section>
  )
}