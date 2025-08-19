"use client"

import { useRouter } from "next/navigation"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"

const products = [
  { label: "Admin", value: "/admin/dashboard" },
  { label: "Studio", value: "/studio" },
]

export function ProductSwitcher() {
  const router = useRouter()
  return (
    <Select
      defaultValue="/admin/dashboard"
      onValueChange={(v) => router.push(v)}
    >
      <SelectTrigger className="w-28" aria-label="Switch product">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="start">
        {products.map((p) => (
          <SelectItem key={p.value} value={p.value}>
            {p.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default ProductSwitcher