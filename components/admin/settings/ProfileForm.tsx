"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StickySaveBar } from "./StickySaveBar"
import { AvatarUploader } from "./AvatarUploader"
import { useToast } from "@/hooks/use-toast"
import {
  profileSettingsSchema,
  type ProfileSettingsInput,
} from "@/lib/schemas/settings"
import {
  changeEmail,
  rollbackSettings,
  sendEmailVerification,
  updateProfile,
} from "@/app/admin/dashboard/settings/actions"

interface ProfileFormProps {
  initialValues: ProfileSettingsInput & {
    emailVerified?: boolean
    providerLocked?: boolean
  }
}

type ChangeEmailState = {
  open: boolean
  submitting: boolean
}

export function ProfileForm({ initialValues }: ProfileFormProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [verificationCooldown, setVerificationCooldown] = useState<number | null>(null)
  const [changeEmailState, setChangeEmailState] = useState<ChangeEmailState>({ open: false, submitting: false })
  const [baseline, setBaseline] = useState(initialValues)

  const form = useForm<ProfileSettingsInput>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: initialValues,
    mode: "onChange",
  })

  useEffect(() => {
    setBaseline(initialValues)
    form.reset(initialValues)
  }, [initialValues, form])

  const timezones = useMemo(() => {
    try {
      return Intl.supportedValuesOf("timeZone")
    } catch {
      return ["UTC", "America/New_York", "Europe/London", "Asia/Tokyo"]
    }
  }, [])

  const handleSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      try {
        const { settings, rollbackToken } = await updateProfile(values)
        setBaseline(settings.profile)
        form.reset(settings.profile)
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
          duration: 5000,
        })
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to save profile")
      }
    })
  })

  const sendVerification = () => {
    if (verificationCooldown && verificationCooldown > Date.now()) return
    startTransition(async () => {
      try {
        await sendEmailVerification({ email: form.getValues("email") })
        const expiry = Date.now() + 60 * 1000
        setVerificationCooldown(expiry)
        toast.success("Verification email sent", {
          description: "Check your inbox and follow the link to verify",
        })
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to send verification")
      }
    })
  }

  const submitChangeEmail = (newEmail: string) => {
    setChangeEmailState({ open: false, submitting: true })
    startTransition(async () => {
      try {
        const { settings, rollbackToken } = await changeEmail({ newEmail })
        setBaseline(settings.profile)
        form.reset(settings.profile)
        toast.success("Email updated", {
          action: {
            label: "Undo",
            onClick: async () => {
              try {
                await rollbackSettings(rollbackToken)
                toast.success("Email restored")
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Unable to rollback")
              }
            },
          },
        })
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to change email")
      } finally {
        setChangeEmailState({ open: false, submitting: false })
      }
    })
  }

  const cooldownRemaining = verificationCooldown
    ? Math.max(0, Math.ceil((verificationCooldown - Date.now()) / 1000))
    : 0

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <AvatarUploader
            value={form.watch("avatarUrl")}
            displayName={form.watch("displayName")}
            onAvatarUploaded={({ url }) => form.setValue("avatarUrl", url, { shouldDirty: true })}
          />
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display name</Label>
              <Input id="displayName" placeholder="Your name" {...form.register("displayName")}
                aria-invalid={!!form.formState.errors.displayName}
              />
              {form.formState.errors.displayName && (
                <p className="text-sm text-destructive" role="alert">
                  {form.formState.errors.displayName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                rows={4}
                placeholder="A short description about you"
                {...form.register("bio")}
                aria-invalid={!!form.formState.errors.bio}
              />
              {form.formState.errors.bio && (
                <p className="text-sm text-destructive" role="alert">
                  {form.formState.errors.bio.message}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex flex-col gap-3 rounded-lg border p-4">
              <div className="flex items-center justify-between gap-2">
                <Input
                  id="email"
                  type="email"
                  readOnly={initialValues.providerLocked}
                  {...form.register("email")}
                  aria-invalid={!!form.formState.errors.email}
                  className={initialValues.providerLocked ? "bg-muted" : undefined}
                />
                <Badge variant={initialValues.emailVerified ? "default" : "secondary"}>
                  {initialValues.emailVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setChangeEmailState({ open: true, submitting: false })}
                  disabled={initialValues.providerLocked || isPending}
                >
                  Change email
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={sendVerification}
                  disabled={isPending || cooldownRemaining > 0}
                >
                  {cooldownRemaining > 0 ? `Wait ${cooldownRemaining}s` : "Send verification"}
                </Button>
              </div>
              {form.formState.errors.email && (
                <p className="text-sm text-destructive" role="alert">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={form.watch("timezone") ?? ""}
              onValueChange={(value) => form.setValue("timezone", value, { shouldDirty: true })}
            >
              <SelectTrigger id="timezone">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                <SelectItem value="">Auto</SelectItem>
                {timezones.map((zone) => (
                  <SelectItem key={zone} value={zone}>
                    {zone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.timezone && (
              <p className="text-sm text-destructive" role="alert">
                {form.formState.errors.timezone.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <StickySaveBar
        isDirty={form.formState.isDirty}
        isSubmitting={isPending}
        onSave={() => handleSubmit()}
        onReset={() => form.reset(baseline)}
      />

      <Dialog open={changeEmailState.open} onOpenChange={(open) => setChangeEmailState({ open, submitting: false })}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change email</DialogTitle>
            <DialogDescription>
              Enter a new email address. We will send a verification link before switching.
            </DialogDescription>
          </DialogHeader>
          <ChangeEmailForm
            onSubmit={submitChangeEmail}
            initialEmail={form.getValues("email")}
            disabled={isPending || changeEmailState.submitting}
          />
        </DialogContent>
      </Dialog>
    </form>
  )
}

function ChangeEmailForm({
  onSubmit,
  initialEmail,
  disabled,
}: {
  onSubmit: (email: string) => void
  initialEmail: string
  disabled?: boolean
}) {
  const [email, setEmail] = useState(initialEmail)
  const [error, setError] = useState<string | null>(null)

  const validate = () => {
    const parsed = profileSettingsSchema.pick({ email: true }).safeParse({ email })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid email")
      return false
    }
    setError(null)
    return true
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        if (!validate()) return
        onSubmit(email)
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="newEmail">New email</Label>
        <Input
          id="newEmail"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onBlur={validate}
          aria-invalid={!!error}
          disabled={disabled}
        />
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
      <DialogFooter>
        <Button type="submit" disabled={disabled}>
          Confirm
        </Button>
      </DialogFooter>
    </form>
  )
}