import express, { Request, Response } from "express";
import cors from "cors";
import {
  addComment,
  getCategories,
  getCommentsForPost,
  getPostBySlug,
  getPosts,
  getVideoBySlug,
  getVideos,
  submitCareerApplication,
  submitContactMessage,
} from "@website/shared";

export function createApp() {
  const app = express();

  const allowedOrigins =
    process.env.CORS_ALLOWED_ORIGINS?.split(/[,\s]+/).filter(Boolean) ?? [];

  if (allowedOrigins.length === 0) {
    throw new Error("CORS_ALLOWED_ORIGINS must be set to a comma-separated list of allowed origins");
  }

  const isOriginAllowed = (origin: string | undefined) => {
    if (!origin) return false; // Reject requests without an origin when credentials are required
    return allowedOrigins.includes(origin);
  };

  app.use(
    cors({
      origin(origin, callback) {
        if (isOriginAllowed(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Origin not allowed by CORS"));
        }
      },
      credentials: true,
      optionsSuccessStatus: 204,
    }),
  );

  app.use(express.json());

  app.get("/healthz", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  app.get("/posts", async (req: Request, res: Response) => {
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

  app.get("/posts/:slug", async (req: Request, res: Response) => {
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

  app.get("/videos", async (_req: Request, res: Response) => {
    try {
      const videos = await getVideos();
      res.json(videos);
    } catch (error) {
      console.error("Failed to fetch videos", error);
      res.status(500).json({ error: "Failed to fetch videos" });
    }
  });

  app.get("/videos/:slug", async (req: Request, res: Response) => {
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

  app.get("/categories", async (req: Request, res: Response) => {
    try {
      const typeQuery = typeof req.query.type === "string" ? req.query.type : undefined;
      const categories = await getCategories(typeQuery as "blog" | "video" | "all" | undefined);
      res.json(categories);
    } catch (error) {
      console.error("Failed to fetch categories", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/comments", async (req: Request, res: Response) => {
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

  app.post("/comments", async (req: Request, res: Response) => {
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

  app.post("/contact", async (req: Request, res: Response) => {
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

  app.post("/career", async (req: Request, res: Response) => {
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

  return app;
}

export type AppInstance = ReturnType<typeof createApp>;
