import { Badge } from "@/components/ui/badge"

export interface VideoStatusBadgeProps {
  status: "draft" | "published" | "unlisted"
}

export default function VideoStatusBadge({ status }: VideoStatusBadgeProps) {
  const styles: Record<VideoStatusBadgeProps["status"], string> = {
    draft: "bg-gray-100 text-gray-800",
    published: "bg-green-100 text-green-800",
    unlisted: "bg-yellow-100 text-yellow-800",
  }
  return <Badge className={styles[status]}>{status}</Badge>
}
