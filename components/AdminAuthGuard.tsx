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
      // If not logged in, redirect to login
      if (!firebaseUser) {
        router.replace("/admin/login")
      } else {
        setUser(firebaseUser)
      }
      setAuthChecked(true)
    })
    return () => unsubscribe()
  }, [router])

  // --- Optionally restrict access by email, matching server policy ---
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

  // If user is not allowed (wrong email), force logout and redirect
  if (authChecked && user && adminEmail && user.email !== adminEmail) {
    // Optionally, sign out user here if desired
    // getAuth(app).signOut()
    router.replace("/admin/login")
    return null
  }

  return <>{user && isAllowed && children}</>
}
