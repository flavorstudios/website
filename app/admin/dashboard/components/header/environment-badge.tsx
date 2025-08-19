"use client"

import { Badge } from "@/components/ui/badge"

export function EnvironmentBadge() {
  const env =
    process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || "production"
  const color =
    env === "production"
      ? "bg-emerald-600"
      : env === "staging"
      ? "bg-amber-500"
      : "bg-red-600"
  return (
    <Badge
      variant="secondary"
      className={`${color} text-white capitalize`}
      aria-label={`Environment: ${env}`}
    >
      {env}
    </Badge>
  )
}

export default EnvironmentBadge