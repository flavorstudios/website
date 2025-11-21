# Backend service

This backend is an Express API that consumes the `@website/shared` workspace package. It is built with TypeScript and is deployed to Google Cloud Run using a Dockerfile in this directory.

## Building locally with Docker

The Dockerfile is self-contained and only needs the repository root as the build context:

```bash
docker build -f backend/Dockerfile -t website-backend .
```

> Cloud Build provides Docker, but the development container used for this repository may not. If Docker is not available locally, run the command in an environment with Docker installed.

## Running the container locally

Run the image and expose the Cloud Run port (8080 by default):

```bash
docker run --rm -p 8080:8080 -e PORT=8080 website-backend
```

Check health:

```bash
curl http://localhost:8080/healthz
```

## How the Dockerfile works

1. **Install dependencies**: Uses `pnpm` with the root `pnpm-lock.yaml` and workspace manifest to install only the backend and shared workspace packages.
2. **Build**: Builds `@website/shared` followed by the backend TypeScript, then prunes dev dependencies for production.
3. **Runtime image**: Copies only built artifacts and production dependencies into a slim Node.js 22 image and starts the server with `node dist/index.js`.

The server reads `process.env.PORT` (default `4000`) and is compatible with Cloud Run's default `PORT=8080`.

## Required environment

Set these variables in Cloud Run (values depend on your project):

- `PORT` (Cloud Run provides 8080 automatically)
- `CORS_ALLOWED_ORIGINS` – Comma or space separated origins for CORS

Other runtime configuration is pulled from the shared package; add variables here if new dependencies are introduced.
