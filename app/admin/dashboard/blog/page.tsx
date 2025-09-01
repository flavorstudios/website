import { redirect } from "next/navigation";

export default function BlogPage() {
  redirect("/admin/dashboard/blog-posts");
}