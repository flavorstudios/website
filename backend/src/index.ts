import express from "express";
import cors from "cors";
import { getPosts } from "@website/shared";

const PORT = Number(process.env.PORT || 4000);
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ALLOWED_ORIGINS?.split(/[,\s]+/).filter(Boolean),
    credentials: true,
  }),
);

app.get("/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/posts", async (req, res) => {
  try {
    const posts = await getPosts({
      author: typeof req.query.author === "string" ? req.query.author : undefined,
      startDate: typeof req.query.startDate === "string" ? req.query.startDate : undefined,
      endDate: typeof req.query.endDate === "string" ? req.query.endDate : undefined,
    });
    res.json(posts);
  } catch (error) {
    console.error("Failed to fetch posts", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});