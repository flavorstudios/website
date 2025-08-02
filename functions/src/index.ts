/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from "firebase-functions";
// import { onRequest } from "firebase-functions/https";
// import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

setGlobalOptions({ maxInstances: 10 });

// Export your functions from submodules here, e.g.:
export * from "./public/contact";
export * from "./public/blogs";
// export * from "./public/videos";
// export * from "./admin/auth";
// ...add more exports as you migrate endpoints

// Health check function for debugging:
export * from "./test";

// If you want to keep the example function, uncomment and update:
// export const helloWorld = onRequest((request, response) => {
//   response.send("Hello from Firebase!");
// });
