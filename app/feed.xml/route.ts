import { redirect } from "next/navigation"

export async function GET(): Promise<Response> {
  // Redirect to the main RSS feed
  return redirect("/rss.xml")
}
