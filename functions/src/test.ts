import * as functions from "firebase-functions";
import type { Request, Response } from "express";

// Minimal hello world for Cloud Functions
export const helloTest = functions.https.onRequest(
  async (req: Request, res: Response) => {
    res.json({ status: "OK", msg: "Hello from test!" });
  }
);
