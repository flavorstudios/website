"use client"

import * as Icons from "lucide-react"
import type { LucideProps } from "lucide-react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

const ICON_NAMES = [
  "Book",
  "Play",
  "Video",
  "Tag",
  "Star",
  "Users",
  "Heart",
  "Camera",
]

interface IconSelectorProps {
  value: string
  onChange: (value: string) => void
}

export default function IconSelector({ value, onChange }: IconSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label="Icon">
        <SelectValue placeholder="Select icon" />
      </SelectTrigger>
      <SelectContent>
        {ICON_NAMES.map((name) => {
          const Icon = (Icons as Record<string, React.ComponentType<LucideProps>>)[name]
          return (
            <SelectItem key={name} value={name}>
              <div className="flex items-center gap-2">
                {Icon && <Icon className="w-4 h-4" />}
                <span>{name}</span>
              </div>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
