import { setGlobalOptions } from "firebase-functions";

// Set global function options (e.g. max concurrent instances)
setGlobalOptions({ maxInstances: 10 });

// Export public API endpoints
export * from "./public/contact";
export * from "./public/blogs";      // ✅ Enable blogs endpoint! (now plural)
export * from "./public/categories"; // ✅ New categories endpoint

// Export test endpoint (for health check or debugging)
export * from "./test";

// Add more exports as you migrate new features:
// export * from "./public/other-endpoint";
// export * from "./admin/auth";
// ...etc.
export * from "./scheduler";
