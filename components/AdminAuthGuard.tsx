"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAuth, onAuthStateChanged, User } from "firebase/auth"
import app from "@/lib/firebase"
import { Loader2 } from "lucide-react"

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [authChecked, setAuthChecked] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const auth = getAuth(app)
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        router.replace("/admin/login")
      } else {
        setUser(firebaseUser)
      }
      setAuthChecked(true)
    })
    return () => unsubscribe()
  }, [router])

  // Optionally restrict by admin email from env (developer/deployment-side only)
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
  const isAllowed =
    user &&
    (!adminEmail || user.email === adminEmail)

  if (!authChecked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin mb-4 h-8 w-8 text-purple-500" />
        <p className="text-gray-500 text-sm">Checking admin authentication…</p>
      </div>
    )
  }

  // If the logged-in user is not allowed (wrong email), redirect and optionally sign out
  if (authChecked && user && adminEmail && user.email !== adminEmail) {
    // Optional: log the user out client-side for immediate effect
    // getAuth(app).signOut()
    router.replace("/admin/login")
    return null
  }

  // Only render children if user is authenticated and allowed (or if adminEmail check is off)
  return <>{user && isAllowed && children}</>
}
