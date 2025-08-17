# Page snapshot

```yaml
- button "Open Next.js Dev Tools":
  - img
- button "Open issues overlay": 1 Issue
- navigation:
  - button "previous" [disabled]:
    - img "previous"
  - text: 1/1
  - button "next" [disabled]:
    - img "next"
- img
- link "Next.js 15.4.4 (stale) Webpack":
  - /url: https://nextjs.org/docs/messages/version-staleness
  - img
  - text: Next.js 15.4.4 (stale) Webpack
- img
- dialog "Build Error":
  - text: Build Error
  - button "Copy Stack Trace":
    - img
  - button "No related documentation found" [disabled]:
    - img
  - link "Learn more about enabling Node.js inspector for server code with Chrome DevTools":
    - /url: https://nextjs.org/docs/app/building-your-application/configuring/debugging#server-side-code
    - img
  - paragraph: "Module build failed: UnhandledSchemeError: Reading from \"node:process\" is not handled by plugins (Unhandled scheme)."
  - img
  - text: node:process
  - button "Open in editor":
    - img
  - text: "Module build failed: UnhandledSchemeError: Reading from \"node:process\" is not handled by plugins (Unhandled scheme). Webpack supports \"data:\" and \"file:\" URIs by default. You may need an additional plugin to handle \"node:\" URIs."
- alert
```