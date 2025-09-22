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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type LoginCardProps = {
  siteName: string
}

export function LoginCard({ siteName }: LoginCardProps) {
  return (
    <Card className="w-full max-w-md rounded-3xl border-border/60 bg-card/95 shadow-[0_20px_45px_-20px_rgba(15,23,42,0.45)] backdrop-blur">
      <CardHeader className="space-y-4 pb-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <span className="text-2xl font-semibold">FS</span>
        </div>
        <div className="space-y-1">
          <CardTitle className="text-3xl font-semibold tracking-tight">Sign in</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Use your {siteName} account to continue
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form action="#" method="post" className="space-y-6" aria-label={`${siteName} login`}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-email" className="text-sm font-medium">
                Email or phone
              </Label>
              <Link href="/support" className="text-sm font-medium text-primary hover:underline">
                Forgot email?
              </Link>
            </div>
            <Input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-describedby="login-helper"
              required
              size="lg"
              className="rounded-2xl"
            />
            <p id="login-helper" className="text-sm text-muted-foreground">
              Not your device? Use a private window to keep your account secure.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button asChild variant="ghost" className="px-0 font-semibold text-primary hover:bg-transparent hover:underline">
              <Link href="/signup">Create account</Link>
            </Button>
            <Button type="submit" variant="brand" size="lg" className="rounded-2xl px-8">
              Next
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <Link href="/privacy-policy" className="hover:text-primary hover:underline">
          Privacy
        </Link>
        <Link href="/terms-of-service" className="hover:text-primary hover:underline">
          Terms
        </Link>
        <Link href="/support" className="hover:text-primary hover:underline">
          Help
        </Link>
      </CardFooter>
    </Card>
  )
}