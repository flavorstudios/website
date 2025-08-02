import * as functions from "firebase-functions";
import type { Request, Response } from "express";
import { db } from "../config"; // Assuming you moved your db init here

export const getBlogs = functions.https.onRequest(
  async (req: Request, res: Response) => {
    try {
      const snap = await db.collection("blogs")
        .where("status", "==", "published")
        .orderBy("createdAt", "desc")
        .get();
      const data = snap.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        summary: doc.data().summary,
        createdAt: doc.data().createdAt,
      }));
      res.json({ blogs: data });
    } catch (err) {
      console.error("[BLOGS_FETCH_ERROR]", err);
      res.status(500).send("Error fetching blogs");
    }
  }
);
