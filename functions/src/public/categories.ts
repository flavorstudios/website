import { onRequest } from "firebase-functions/v2/https";
import fs from "fs/promises";
import path from "path";

interface Category {
  name: string;
  type: "blog" | "video";
  count: number;
  tooltip?: string;
  [key: string]: any;
}

function format(arr: Partial<Category>[], type: "blog" | "video"): Category[] {
  return (arr || [])
    .filter((c) => c.isActive)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((c) => ({
      ...c,
      name: c.title,
      type,
      count: c.postCount ?? 0,
      tooltip: c.tooltip ?? undefined,
    })) as Category[];
}

export const getCategories = onRequest({ cors: true }, async (req, res) => {

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const filePath = path.join(
      __dirname,
      "../../../content-data/categories.json",
    );
    const json = await fs.readFile(filePath, "utf8");
    const siteData = JSON.parse(json);
    const { blog = [], watch = [] } = siteData.CATEGORIES || {};

    const type = req.query.type as string | undefined;

    if (type === "blog") {
      res.set("Cache-Control", "public, max-age=300");
      res.json({ categories: format(blog, "blog") });
      return;
    }

    if (type === "video") {
      res.set("Cache-Control", "public, max-age=300");
      res.json({ categories: format(watch, "video") });
      return;
    }

    res.set("Cache-Control", "public, max-age=300");
    res.json({
      blogCategories: format(blog, "blog"),
      videoCategories: format(watch, "video"),
    });
  } catch (err) {
    console.error("[CATEGORIES_GET_ERROR]", err);
    res.status(500).json({
      blogCategories: [],
      videoCategories: [],
      error: "Failed to get categories",
    });
  }
});