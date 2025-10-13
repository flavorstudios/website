"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type LoginCardProps = {
  siteName: string
}

type LoginFormErrors = {
  email: string | null
  password: string | null
}

const GoogleIcon = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 text-slate-800"
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <text
      x="12"
      y="12"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="11"
      fontFamily="'Poppins', sans-serif"
      fontWeight="600"
      fill="currentColor"
    >
      G
    </text>
  </svg>
)

export function LoginCard({ siteName }: LoginCardProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState({ email: false, password: false })
  const [errors, setErrors] = useState<LoginFormErrors>({ email: null, password: null })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const emailHelperId = "login-email-helper"
  const emailErrorId = "login-email-error"
  const passwordHelperId = "login-password-helper"
  const passwordErrorId = "login-password-error"

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      return "Enter a valid email address."
    }

    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!pattern.test(value)) {
      return "Enter a valid email address."
    }

    return null
  }

  const validatePassword = (value: string) => {
    if (!value.trim()) {
      return "Enter your password."
    }

    if (value.length < 8) {
      return "Passwords must be at least 8 characters long."
    }

    return null
  }

  const onSubmit = async (formValues: { email: string; password: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.info("Login submitted", formValues)
    }
  }

  const onContinueWithGoogle = async () => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.info("Continue with Google selected")
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const emailValidation = validateEmail(email)
    const passwordValidation = validatePassword(password)

    setErrors({ email: emailValidation, password: passwordValidation })
    setTouched({ email: true, password: true })

    if (emailValidation || passwordValidation) {
      return
    }

    try {
      setIsSubmitting(true)
      await onSubmit({ email, password })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContinueWithGoogle = async () => {
    await onContinueWithGoogle()
  }

  const emailDescribedBy = errors.email
    ? `${emailHelperId} ${emailErrorId}`
    : emailHelperId

  const passwordDescribedBy = errors.password
    ? `${passwordHelperId} ${passwordErrorId}`
    : passwordHelperId

  return (
    <Card className="mx-auto w-full max-w-[380px] rounded-3xl border-border/70 bg-card/95 shadow-[0_20px_45px_-20px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:max-w-[440px] lg:max-w-[520px]">
      <CardHeader className="space-y-3 px-6 pb-4 pt-8 text-center sm:px-10 sm:pb-6 sm:pt-10 lg:px-12 lg:pb-8 lg:pt-12">
        <CardTitle className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Welcome back
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          Create, schedule, and manage your stories.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 px-6 pb-6 sm:space-y-10 sm:px-10 sm:pb-10 lg:space-y-12 lg:px-12">
        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="h-auto w-full justify-center rounded-2xl border-border/70 bg-background/80 px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition hover:bg-accent/60 hover:text-foreground focus-visible:ring-ring"
            onClick={handleContinueWithGoogle}
            aria-label="Continue with Google"
          >
            <GoogleIcon />
            Continue with Google
          </Button>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium uppercase tracking-[0.18em]">Or continue with</span>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
          </div>
        </div>

        <form
          noValidate
          onSubmit={handleSubmit}
          className="space-y-6 sm:space-y-8"
          aria-label={`${siteName} login form`}
        >
          <div className="space-y-2">
            <Label htmlFor="login-email" className="text-sm font-semibold text-foreground">
              Email
            </Label>
            <Input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                const nextValue = event.target.value
                setEmail(nextValue)
                if (touched.email) {
                  setErrors((prev) => ({ ...prev, email: validateEmail(nextValue) }))
                }
              }}
              onBlur={() => {
                setTouched((prev) => ({ ...prev, email: true }))
                setErrors((prev) => ({ ...prev, email: validateEmail(email) }))
              }}
              aria-describedby={emailDescribedBy}
              aria-invalid={errors.email ? true : undefined}
              placeholder="you@example.com"
              variantSize="lg"
              className="rounded-2xl"
            />
            <p id={emailHelperId} className="text-sm text-muted-foreground">
              We&apos;ll use this email to keep your account secure and send important updates.
            </p>
            {errors.email ? (
              <p
                id={emailErrorId}
                role="alert"
                aria-live="polite"
                className="text-sm font-medium text-destructive"
              >
                {errors.email}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password" className="text-sm font-semibold text-foreground">
              Password
            </Label>
            <Input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                const nextValue = event.target.value
                setPassword(nextValue)
                if (touched.password) {
                  setErrors((prev) => ({ ...prev, password: validatePassword(nextValue) }))
                }
              }}
              onBlur={() => {
                setTouched((prev) => ({ ...prev, password: true }))
                setErrors((prev) => ({ ...prev, password: validatePassword(password) }))
              }}
              aria-describedby={passwordDescribedBy}
              aria-invalid={errors.password ? true : undefined}
              placeholder="Enter your password"
              variantSize="lg"
              className="rounded-2xl"
            />
            <p id={passwordHelperId} className="text-sm text-muted-foreground">
              Must include at least 8 characters with a mix of letters, numbers, or symbols.
            </p>
            {errors.password ? (
              <p
                id={passwordErrorId}
                role="alert"
                aria-live="polite"
                className="text-sm font-medium text-destructive"
              >
                {errors.password}
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="login-show-password"
                checked={showPassword}
                onCheckedChange={(checked) => {
                  setShowPassword(checked === true)
                }}
                aria-describedby={passwordHelperId}
              />
              <Label
                htmlFor="login-show-password"
                className="select-none text-sm font-medium text-muted-foreground"
              >
                Show password
              </Label>
            </div>
            <Button
              type="submit"
              variant="brand"
              size="lg"
              className="rounded-2xl px-8"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              Next
            </Button>
          </div>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-2 px-6 pb-8 pt-0 text-center text-xs text-muted-foreground sm:px-10 sm:pb-10 lg:px-12 lg:pb-12">
        <p className="w-full text-pretty leading-relaxed text-muted-foreground sm:max-w-sm">
          By continuing, you agree to our{" "}
          <Link href="/terms-of-service" className="font-medium text-primary hover:underline">
            Terms of Service
          </Link>{" "}
          and acknowledge our{" "}
          <Link href="/privacy-policy" className="font-medium text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <Link href="/privacy-policy" className="hover:text-primary hover:underline">
            Privacy
          </Link>
          <Link href="/terms-of-service" className="hover:text-primary hover:underline">
            Terms
          </Link>
          <Link href="/support" className="hover:text-primary hover:underline">
            Help
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}