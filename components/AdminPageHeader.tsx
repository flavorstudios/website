"use client"

import { cn } from "@/lib/utils"

interface AdminPageHeaderProps {
  title: string
  subtitle?: string
  className?: string
}

export default function AdminPageHeader({ title, subtitle, className }: AdminPageHeaderProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <h1 className="text-2xl font-bold text-gray-900 font-sans">{title}</h1>
      {subtitle && <p className="text-base text-gray-500 mt-1 font-sans">{subtitle}</p>}
    </div>
  )
}