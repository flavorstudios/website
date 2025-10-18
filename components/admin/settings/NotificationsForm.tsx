"use client"

import { useEffect, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StickySaveBar } from "./StickySaveBar"
import { useToast } from "@/hooks/use-toast"
import {
  notificationsSettingsSchema,
  type NotificationsSettingsInput,
} from "@/lib/schemas/settings"
import {
  rollbackSettings,
  sendTestNotification,
  updateNotifications,
} from "@/app/admin/dashboard/settings/actions"

interface NotificationsFormProps {
  initialValues: NotificationsSettingsInput
}

export function NotificationsForm({ initialValues }: NotificationsFormProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [baseline, setBaseline] = useState(initialValues)
  const form = useForm<NotificationsSettingsInput>({
    resolver: zodResolver(notificationsSettingsSchema),
    defaultValues: initialValues,
    mode: "onChange",
  })
  const [quietEnabled, setQuietEnabled] = useState<boolean>(!!initialValues.quiet)

  useEffect(() => {
    setBaseline(initialValues)
    setQuietEnabled(!!initialValues.quiet)
    form.reset(initialValues)
  }, [initialValues, form])

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      try {
        const { settings, rollbackToken } = await updateNotifications({
          ...values,
          quiet: quietEnabled ? values.quiet : undefined,
        })
        setBaseline(settings.notifications)
        form.reset(settings.notifications)
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
        toast.error(error instanceof Error ? error.message : "Failed to update notifications")
      }
    })
  })

  const handleTestNotification = (channel: "email" | "inApp") => {
    startTransition(async () => {
      try {
        await sendTestNotification(channel)
        toast.success(`Test ${channel === "email" ? "email" : "in-app"} notification sent`)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to send test notification")
      }
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <ToggleField
          label="Email notifications"
          description="Receive updates and alerts via email."
          checked={form.watch("email.enabled")}
          onCheckedChange={(value) => form.setValue("email.enabled", value, { shouldDirty: true })}
        />
        <ToggleField
          label="In-app notifications"
          description="Show alerts inside the dashboard."
          checked={form.watch("inApp.enabled")}
          onCheckedChange={(value) => form.setValue("inApp.enabled", value, { shouldDirty: true })}
        />
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <p className="text-sm font-medium">Events</p>
        {([
          ["comments", "New comments"],
          ["applications", "Job applications"],
          ["system", "System announcements"],
        ] as const).map(([key, label]) => (
          <ToggleField
            key={key}
            label={label}
            description=""
            checked={form.watch(`events.${key}` as const)}
            onCheckedChange={(value) =>
              form.setValue(`events.${key}` as const, value, { shouldDirty: true })
            }
          />
        ))}
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Quiet hours</p>
            <p className="text-sm text-muted-foreground">
              Mute notifications during specific hours.
            </p>
          </div>
          <Switch
            checked={quietEnabled}
            onCheckedChange={(checked) => {
              setQuietEnabled(checked)
              if (!checked) {
                form.setValue("quiet", undefined, { shouldDirty: true })
              } else {
                form.setValue("quiet", initialValues.quiet ?? { from: "22:00", to: "07:00" }, { shouldDirty: true })
              }
            }}
          />
        </div>
        {quietEnabled && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quiet-from">From</Label>
              <Input
                id="quiet-from"
                type="time"
                value={form.watch("quiet.from") ?? ""}
                onChange={(event) =>
                  form.setValue(
                    "quiet",
                    { ...(form.getValues("quiet") ?? { to: "07:00" }), from: event.target.value },
                    { shouldDirty: true },
                  )
                }
              />
              {form.formState.errors.quiet?.from && (
                <p className="text-sm text-destructive" role="alert">
                  {form.formState.errors.quiet.from.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="quiet-to">To</Label>
              <Input
                id="quiet-to"
                type="time"
                value={form.watch("quiet.to") ?? ""}
                onChange={(event) =>
                  form.setValue(
                    "quiet",
                    { ...(form.getValues("quiet") ?? { from: "22:00" }), to: event.target.value },
                    { shouldDirty: true },
                  )
                }
              />
              {form.formState.errors.quiet?.to && (
                <p className="text-sm text-destructive" role="alert">
                  {form.formState.errors.quiet.to.message}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" onClick={() => handleTestNotification("email")}>
          Send test email
        </Button>
        <Button type="button" variant="outline" onClick={() => handleTestNotification("inApp")}>
          Send test in-app
        </Button>
      </div>

      <StickySaveBar
        isDirty={form.formState.isDirty}
        isSubmitting={isPending}
        onSave={() => onSubmit()}
        onReset={() => form.reset(baseline)}
      />
    </form>
  )
}

function ToggleField({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string
  description: string
  checked: boolean
  onCheckedChange: (value: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4">
      <Switch checked={checked} onCheckedChange={onCheckedChange} className="mt-1" />
      <div>
        <p className="font-medium leading-none">{label}</p>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
    </label>
  )
}