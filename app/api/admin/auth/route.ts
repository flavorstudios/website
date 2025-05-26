import { type NextRequest, NextResponse } from "next/server"

const ADMIN_CREDENTIALS = {
  email: "admin@flavorstudios.in",
  password: "admin123",
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      const response = NextResponse.json({
        success: true,
        user: { email, name: "Admin" },
      })

      // Set a simple session cookie
      response.cookies.set("admin-session", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      })

      return response
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete("admin-session")
  return response
}

export async function GET(request: NextRequest) {
  const session = request.cookies.get("admin-session")

  if (session?.value === "authenticated") {
    return NextResponse.json({
      authenticated: true,
      user: { email: ADMIN_CREDENTIALS.email, name: "Admin" },
    })
  }

  return NextResponse.json({ authenticated: false }, { status: 401 })
}
