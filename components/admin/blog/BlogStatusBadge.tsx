import { Badge } from "@/components/ui/badge"

export interface BlogStatusBadgeProps {
  status: "draft" | "published" | "scheduled"
}

export default function BlogStatusBadge({ status }: BlogStatusBadgeProps) {
  const styles: Record<BlogStatusBadgeProps["status"], string> = {
    draft: "bg-gray-100 text-gray-800",
    published: "bg-green-100 text-green-800",
    scheduled: "bg-yellow-100 text-yellow-800",
  }

  return <Badge className={styles[status]}>{status}</Badge>
}
