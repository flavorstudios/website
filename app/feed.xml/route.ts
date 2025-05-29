import { redirect } from "next/navigation"

export async function GET() {
  // Redirect to the main RSS feed
  redirect("/rss.xml")
}
