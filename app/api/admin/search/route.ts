import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { blogStore, videoStore } from "@/lib/content-store";
import { getAdminAuth } from "@/lib/firebase-admin";
import type { Category } from "@/types/category";
import fs from "fs/promises";
import path from "path";

const CATEGORIES_PATH = path.join(process.cwd(), "content-data", "categories.json");

async function readCategories(): Promise<Category[]> {
  const raw = await fs.readFile(CATEGORIES_PATH, "utf-8");
  const json = JSON.parse(raw) as {
    CATEGORIES: { blog?: Category[]; watch?: Category[] };
  };
  const blog = (json.CATEGORIES?.blog || []).map((c) => ({ ...c, name: c.title })) as Category[];
  const watch = (json.CATEGORIES?.watch || []).map((c) => ({ ...c, name: c.title })) as Category[];
  return [...blog, ...watch];
}

export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get("q")?.toLowerCase().trim() || "";
  if (query.length < 2) {
    return NextResponse.json({ posts: [], videos: [], users: [], categories: [], tags: [] });
  }

  const auth = getAdminAuth();
  const [postsAll, videosAll, usersList, categories] = await Promise.all([
    blogStore.getAll(),
    videoStore.getAll(),
    auth.listUsers(1000).then((r) => r.users),
    readCategories(),
  ]);

  const posts = postsAll
    .filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.slug.toLowerCase().includes(query) ||
        p.excerpt.toLowerCase().includes(query) ||
        p.tags?.some((t) => t.toLowerCase().includes(query))
    )
    .slice(0, 5)
    .map((p) => ({ id: p.id, title: p.title, slug: p.slug }));

  const videos = videosAll
    .filter(
      (v) =>
        v.title.toLowerCase().includes(query) ||
        v.slug.toLowerCase().includes(query) ||
        v.tags?.some((t) => t.toLowerCase().includes(query))
    )
    .slice(0, 5)
    .map((v) => ({ id: v.id, title: v.title, slug: v.slug }));

  const users = usersList
    .filter(
      (u) =>
        u.email?.toLowerCase().includes(query) ||
        u.displayName?.toLowerCase().includes(query)
    )
    .slice(0, 5)
    .map((u) => ({ uid: u.uid, email: u.email, displayName: u.displayName }));

  const categoryResults = categories
    .filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.slug.toLowerCase().includes(query)
    )
    .slice(0, 5)
    .map((c) => ({ id: c.id, title: c.title, slug: c.slug, type: c.type }));

  // Aggregate unique tags from posts
  const tagSet = new Set<string>();
  postsAll.forEach((p) => p.tags?.forEach((t) => tagSet.add(t)));
  const tags = Array.from(tagSet)
    .filter((t) => t.toLowerCase().includes(query))
    .slice(0, 5);

  return NextResponse.json({ posts, videos, users, categories: categoryResults, tags });
}

export const revalidate = 0;