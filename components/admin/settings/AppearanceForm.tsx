"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { StickySaveBar } from "./StickySaveBar"
import { ThemePreview } from "./ThemePreview"
import { useToast } from "@/hooks/use-toast"
import {
  appearanceSettingsSchema,
  type AppearanceSettingsInput,
} from "@/lib/schemas/settings"
import {
  resetAppearance,
  rollbackSettings,
  updateAppearance,
} from "@/app/admin/dashboard/settings/actions"
import { getContrastRatio } from "@/lib/settings/client"

interface AppearanceFormProps {
  initialValues: AppearanceSettingsInput
}

const ACCENT_PRESETS = ["#7c3aed", "#2563eb", "#16a34a", "#ea580c", "#ec4899"]

export function AppearanceForm({ initialValues }: AppearanceFormProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [baseline, setBaseline] = useState(initialValues)
  const form = useForm<AppearanceSettingsInput>({
    resolver: zodResolver(appearanceSettingsSchema),
    defaultValues: initialValues,
    mode: "onChange",
  })

  useEffect(() => {
    setBaseline(initialValues)
    form.reset(initialValues)
  }, [initialValues, form])

  const accent = form.watch("accent")
  const appearance = form.watch()

  const accentError = useMemo(() => {
    try {
      const { meetsAA, ratio } = getContrastRatio(accent)
      return meetsAA ? null : `Contrast ratio ${ratio.toFixed(2)} does not meet WCAG AA`
    } catch {
      return "Invalid accent color"
    }
  }, [accent])

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      try {
        const { settings, rollbackToken } = await updateAppearance(values)
        setBaseline(settings.appearance)
        form.reset(settings.appearance)
        toast.success("Settings saved", {
          action: {
            label: "Undo",
            onClick: async () => {
              try {
                await rollbackSettings(rollbackToken)
                toast.success("Changes reverted")
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Unable to rollback")
              }
            },
          },
        })
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to update appearance")
      }
    })
  })

  const handleReset = () => {
    startTransition(async () => {
      try {
        const { settings, rollbackToken } = await resetAppearance()
        setBaseline(settings.appearance)
        form.reset(settings.appearance)
        toast.success("Appearance reset", {
          action: {
            label: "Undo",
            onClick: async () => {
              try {
                await rollbackSettings(rollbackToken)
                toast.success("Changes reverted")
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Unable to rollback")
              }
            },
          },
        })
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to reset appearance")
      }
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="theme">Theme</Label>
            <Select
              value={form.watch("theme")}
              onValueChange={(value) => form.setValue("theme", value as AppearanceSettingsInput["theme"], { shouldDirty: true })}
            >
              <SelectTrigger id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <Label>Accent color</Label>
            <div className="flex flex-wrap items-center gap-2">
              {ACCENT_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={"h-9 w-9 rounded-full border-2"}
                  style={{
                    backgroundColor: preset,
                    borderColor: form.watch("accent") === preset ? preset : "transparent",
                  }}
                  aria-label={`Use ${preset}`}
                  onClick={() => form.setValue("accent", preset, { shouldDirty: true })}
                />
              ))}
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={form.watch("accent")}
                  onChange={(event) => form.setValue("accent", event.target.value, { shouldDirty: true })}
                  className="h-10 w-12 p-1"
                  aria-label="Custom accent"
                />
                <Input
                  value={form.watch("accent")}
                  onChange={(event) => form.setValue("accent", event.target.value, { shouldDirty: true })}
                  className="w-24"
                  aria-label="Accent hex"
                />
              </div>
            </div>
            {accentError && (
              <p className="text-sm text-destructive" role="alert">
                {accentError}
              </p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="density">Density</Label>
              <Select
                value={form.watch("density") ?? "comfortable"}
                onValueChange={(value) => form.setValue("density", value as AppearanceSettingsInput["density"], { shouldDirty: true })}
              >
                <SelectTrigger id="density">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reduced-motion">Reduced motion</Label>
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <Switch
                  id="reduced-motion"
                  checked={!!form.watch("reducedMotion")}
                  onCheckedChange={(checked) => form.setValue("reducedMotion", checked, { shouldDirty: true })}
                />
                <span className="text-sm text-muted-foreground">Limit animations and transitions</span>
              </div>
            </div>
          </div>
        </div>
        <ThemePreview appearance={appearance} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" onClick={handleReset} disabled={isPending}>
          Reset to defaults
        </Button>
      </div>

      <StickySaveBar
        isDirty={form.formState.isDirty}
        isSubmitting={isPending}
        onSave={() => {
          if (accentError) {
            toast.error(accentError)
            return
          }
          onSubmit()
        }}
        onReset={() => form.reset(baseline)}
      />
    </form>
  )
}