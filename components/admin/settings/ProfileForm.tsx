"use client"

import { useCallback, useEffect, useState, useTransition } from "react"
import type { FormEvent } from "react"
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
  uploadAvatar,
} from "@/app/admin/dashboard/(settings)/settings/actions"
import { getFirebaseAuth, firebaseInitError } from "@/lib/firebase"
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth"
import { FirebaseError } from "firebase/app"
import {
  DEFAULT_TIMEZONES,
  areTimezonesEqual,
  readRuntimeTimezones,
} from "@/lib/settings/timezones"

const AUTO_TIMEZONE_VALUE = "__auto__"

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
    form.register("avatarStoragePath")
  }, [form])

  useEffect(() => {
    setBaseline(initialValues)
    form.reset(initialValues)
  }, [initialValues, form])

  const [timezones, setTimezones] = useState<string[]>(() => [...DEFAULT_TIMEZONES])

  useEffect(() => {
    const supported = readRuntimeTimezones()
    if (supported.length === 0) return
    setTimezones((previous) => {
      if (areTimezonesEqual(previous, supported)) {
        return previous
      }
      return [...supported]
    })
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

  const handleAvatarUpload = useCallback(
    async (blob: Blob, filename: string) => {
      const formData = new FormData()
      formData.append("file", blob, filename)
      return await uploadAvatar(formData)
    },
    [],
  )

  const timezoneValue = form.watch("timezone") ?? ""
  const timezoneSelectValue =
    timezoneValue.trim().length === 0 ? AUTO_TIMEZONE_VALUE : timezoneValue

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

  const submitChangeEmail = ({ email: newEmail, token }: { email: string; token: string }) => {
    setChangeEmailState({ open: false, submitting: true })
    startTransition(async () => {
      try {
        const { settings, rollbackToken } = await changeEmail({ newEmail, reauthToken: token })
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
            disabled={isPending}
            onAvatarUploaded={({ url, storagePath }) => {
              form.setValue("avatarUrl", url ?? "", { shouldDirty: true })
              form.setValue("avatarStoragePath", storagePath, { shouldDirty: true })
            }}
            onUploadFile={handleAvatarUpload}
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
              value={timezoneSelectValue}
              onValueChange={(value) =>
                form.setValue(
                  "timezone",
                  value === AUTO_TIMEZONE_VALUE ? "" : value,
                  {
                    shouldDirty: true,
                  },
                )
              }
            >
              <SelectTrigger id="timezone">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                <SelectItem value={AUTO_TIMEZONE_VALUE}>Auto</SelectItem>
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
  onSubmit: (payload: { email: string; token: string }) => void
  initialEmail: string
  disabled?: boolean
}) {
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [reauthError, setReauthError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setEmail(initialEmail)
  }, [initialEmail])

  const validateEmail = useCallback(() => {
    const parsed = profileSettingsSchema.pick({ email: true }).safeParse({ email })
    if (!parsed.success) {
      setEmailError(parsed.error.issues[0]?.message ?? "Enter a valid email")
      return false
    }
    setEmailError(null)
    return true
    }, [email])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validateEmail()) return
    if (!password) {
      setPasswordError("Enter your current password")
      return
    }
    setPasswordError(null)
    setReauthError(null)
    if (firebaseInitError) {
      setReauthError(firebaseInitError.message ?? "Firebase is not configured")
      return
    }
    setSubmitting(true)
    try {
      const auth = getFirebaseAuth()
      const user = auth.currentUser
      if (!user) {
        throw new Error("You must be signed in to change your email")
      }
      const credential = EmailAuthProvider.credential(initialEmail, password)
      await reauthenticateWithCredential(user, credential)
      const token = await user.getIdToken(true)
      onSubmit({ email, token })
    } catch (err) {
      if (err instanceof FirebaseError) {
        if (err.code === "auth/wrong-password") {
          setPasswordError("Incorrect password")
        } else {
          setReauthError(err.message)
        }
      } else if (err instanceof Error) {
        setReauthError(err.message)
      } else {
        setReauthError("Unable to verify credentials")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="newEmail">New email</Label>
        <Input
          id="newEmail"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
            if (emailError) setEmailError(null)
          }}
          onBlur={validateEmail}
          aria-invalid={!!emailError}
          disabled={disabled || submitting}
        />
        {emailError && (
          <p className="text-sm text-destructive" role="alert">
            {emailError}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value)
            if (passwordError) setPasswordError(null)
          }}
          aria-invalid={!!passwordError}
          disabled={disabled || submitting}
        />
        {passwordError && (
          <p className="text-sm text-destructive" role="alert">
            {passwordError}
          </p>
        )}
      </div>
      {reauthError && (
        <p className="text-sm text-destructive" role="alert">
          {reauthError}
        </p>
      )}
      <DialogFooter>
        <Button type="submit" disabled={disabled || submitting}>
          Continue
        </Button>
      </DialogFooter>
    </form>
  )
}