import express from "express";
import cors from "cors";
import {
  addComment,
  getCategories,
  getCommentsForPost,
  getPostBySlug,
  getPosts,
  getVideoBySlug,
  getVideos,
  submitContactMessage,
  submitCareerApplication,
} from "@website/shared";

const PORT = Number(process.env.PORT || 4000);
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ALLOWED_ORIGINS?.split(/[,\s]+/).filter(Boolean),
    credentials: true,
  }),
);

app.use(express.json());

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

app.get("/posts/:slug", async (req, res) => {
  try {
    const post = await getPostBySlug(req.params.slug);
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    res.json(post);
  } catch (error) {
    console.error("Failed to fetch post", error);
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

app.get("/videos", async (_req, res) => {
  try {
    const videos = await getVideos();
    res.json(videos);
  } catch (error) {
    console.error("Failed to fetch videos", error);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

app.get("/videos/:slug", async (req, res) => {
  try {
    const video = await getVideoBySlug(req.params.slug);
    if (!video) {
      res.status(404).json({ error: "Video not found" });
      return;
    }
    res.json(video);
  } catch (error) {
    console.error("Failed to fetch video", error);
    res.status(500).json({ error: "Failed to fetch video" });
  }
});

app.get("/categories", async (req, res) => {
  try {
    const typeQuery = typeof req.query.type === "string" ? req.query.type : undefined;
    const categories = await getCategories(typeQuery as "blog" | "video" | "all" | undefined);
    res.json(categories);
  } catch (error) {
    console.error("Failed to fetch categories", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

app.get("/comments", async (req, res) => {
  try {
    const postId = typeof req.query.postId === "string" ? req.query.postId : "";
    if (!postId) {
      res.status(400).json({ error: "postId is required" });
      return;
    }
    const postType = typeof req.query.postType === "string" ? req.query.postType : undefined;
    const comments = await getCommentsForPost(postId, postType as "blog" | "video" | undefined);
    res.json(comments);
  } catch (error) {
    console.error("Failed to fetch comments", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

app.post("/comments", async (req, res) => {
  try {
    const comment = await addComment({
      postId: req.body?.postId,
      postType: req.body?.postType,
      author: req.body?.author,
      content: req.body?.content,
    });
    res.status(201).json(comment);
  } catch (error) {
    console.error("Failed to create comment", error);
    res.status(400).json({ error: (error as Error).message || "Failed to create comment" });
  }
});

app.post("/contact", async (req, res) => {
  try {
    const submission = await submitContactMessage({
      firstName: req.body?.firstName,
      lastName: req.body?.lastName,
      email: req.body?.email,
      subject: req.body?.subject,
      message: req.body?.message,
    });
    res.status(202).json({ status: "queued", submission });
  } catch (error) {
    console.error("Failed to submit contact message", error);
    res.status(400).json({ error: (error as Error).message || "Failed to submit contact message" });
  }
});

app.post("/career", async (req, res) => {
  try {
    const submission = await submitCareerApplication({
      firstName: req.body?.firstName,
      lastName: req.body?.lastName,
      email: req.body?.email,
      skills: req.body?.skills,
      portfolio: req.body?.portfolio,
      message: req.body?.message,
    });
    res.status(202).json({ status: "queued", submission });
  } catch (error) {
    console.error("Failed to submit career application", error);
    res.status(400).json({
      error: (error as Error).message || "Failed to submit career application",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});