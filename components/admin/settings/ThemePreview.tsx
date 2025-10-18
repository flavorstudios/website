"use client"

import { memo, type CSSProperties } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import type { AppearanceSettingsInput } from "@/lib/schemas/settings"

interface ThemePreviewProps {
  appearance: AppearanceSettingsInput
}

export const ThemePreview = memo(function ThemePreview({ appearance }: ThemePreviewProps) {
  const text = appearance.theme === "dark" ? "text-white" : "text-slate-900"
  const accentStyles: CSSProperties = {
    "--preview-accent": appearance.accent,
  }

  return (
    <Card
      aria-label="Theme preview"
      style={accentStyles}
      className={cn(
        "overflow-hidden border-muted",
        appearance.theme === "dark" ? "bg-slate-900 text-white" : "bg-white text-slate-900",
        appearance.density === "compact" ? "text-sm" : "text-base",
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Preview</span>
          <span className="text-sm text-muted-foreground">{appearance.theme.toUpperCase()}</span>
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Interactive elements update in real time as you tweak your theme.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <Button className="bg-[var(--preview-accent)] text-white hover:bg-[var(--preview-accent)]/90">
            Accent button
          </Button>
          <Switch checked className="data-[state=checked]:bg-[var(--preview-accent)]" />
          <div className="flex-1 min-w-[180px]">
            <Input
              aria-label="Sample input"
              placeholder="Sample input"
              className="focus-visible:ring-[var(--preview-accent)]"
              defaultValue="preview@example.com"
            />
          </div>
        </div>
        <div
          className="rounded-xl border border-dashed p-4"
          style={{ borderColor: appearance.accent }}
        >
          <p className="font-semibold" style={{ color: appearance.accent }}>
            Accent foreground
          </p>
          <p className={cn("mt-1", text === "text-white" ? "text-slate-100" : "text-slate-600")}
            style={{ color: text === "text-white" ? "#cbd5f5" : "#334155" }}
          >
            This box demonstrates text contrast against the current accent selection.
          </p>
        </div>
      </CardContent>
    </Card>
  )
})