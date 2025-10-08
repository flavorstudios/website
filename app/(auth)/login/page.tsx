import { LoginCard } from "@/components/auth";
import { getMetadata } from "@/lib/seo/metadata";
import { SITE_NAME } from "@/lib/constants";

export const metadata = getMetadata({
  title: `Login`,
  description:
    "Sign in to access personalized anime recommendations, track your watchlist, and sync your preferences across devices.",
  path: "/login",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 px-4 py-16">
      <LoginCard siteName={SITE_NAME} />
    </div>
  );
}