# End-to-end tests

The Playwright suite runs against a production build of the Next.js app with test fixtures and network mocks. To execute the tests locally:

```bash
pnpm build && BASE_URL=http://127.0.0.1:3000 E2E=true pnpm start:test
pnpm e2e
```

The `start:test` script launches the Next.js server in test mode (`next dev` by default) with `E2E` mode enabled so that Firebase Admin integrations and external storage calls are short-circuited. The Playwright config bootstraps deterministic storage state, intercepts Firebase Storage/Analytics requests, and seeds dashboard APIs with fixture data. Set `NEXT_E2E_COMMAND=start` if you prefer to run against a production build.