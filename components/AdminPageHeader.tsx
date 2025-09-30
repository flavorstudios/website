"use client"

import { cn } from "@/lib/utils"

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6"

interface AdminPageHeaderProps {
  title: string
  subtitle?: string
  className?: string
  as?: HeadingLevel
}

export default function AdminPageHeader({
  title,
  subtitle,
  className,
  as = "h2",
}: AdminPageHeaderProps) {
  const HeadingTag = as

  return (
    <div className={cn("flex flex-col", className)}>
      <HeadingTag className="text-2xl font-bold text-gray-900 font-sans">{title}</HeadingTag>
      {subtitle && <p className="text-base text-gray-500 mt-1 font-sans">{subtitle}</p>}
    </div>
  )
}