import * as functions from "firebase-functions";
import cors from "cors";
import { db } from "../config"; // Firestore init

// Enable CORS for all origins (customize if needed)
const corsHandler = cors({ origin: true });

export const getBlogs = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }
    try {
      const snap = await db
        .collection("blogs")
        .where("status", "==", "published")
        .orderBy("createdAt", "desc")
        .limit(50) // optional safety limit
        .get();

      const blogs = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title ?? "",
          summary: data.summary ?? "",
          createdAt:
            data.createdAt && data.createdAt.toDate
              ? data.createdAt.toDate()
              : data.createdAt ?? null,
          // Add more fields as needed!
        };
      });

      res.status(200).json({ blogs });
    } catch (err) {
      console.error("[BLOGS_FETCH_ERROR]", err);
      res.status(500).json({ error: "Error fetching blogs" });
    }
  });
});
