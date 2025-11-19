import { permanentRedirect } from "next/navigation";

export async function GET() {
  permanentRedirect("/rss.xml");
}
