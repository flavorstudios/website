"use client"

import { useRouter, usePathname } from "next/navigation"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"

const locales = [
  { label: "EN", value: "en" },
  { label: "ES", value: "es" },
]

export function LocaleToggle() {
  const router = useRouter()
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)
  const currentLocale = segments[0] && locales.some(l=>l.value===segments[0]) ? segments[0] : "en"
  function setLocale(locale: string) {
    const path = segments.slice(currentLocale === segments[0] ? 1 : 0).join("/")
    router.push(`/${locale}/${path}`)
  }
  return (
    <Select defaultValue={currentLocale} onValueChange={setLocale}>
      <SelectTrigger className="w-20" aria-label="Select language">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {locales.map((l) => (
          <SelectItem key={l.value} value={l.value}>
            {l.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default LocaleToggle