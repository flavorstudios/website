import { onRequest } from "firebase-functions/v2/https";

export const helloTest = onRequest(
  {
    cors: true // Allow all origins, for dev/testing
  },
  async (req, res) => {
    res.json({ status: "OK", msg: "Hello from test!" });
  }
);
