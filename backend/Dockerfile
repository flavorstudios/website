# syntax=docker/dockerfile:1
ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-bullseye AS base
ENV PNPM_HOME=/pnpm
ENV PATH="${PNPM_HOME}:${PATH}"
RUN corepack enable && mkdir -p "${PNPM_HOME}" && chmod 0777 "${PNPM_HOME}"
WORKDIR /app

# Install all dependencies and build in a single, consistent workspace
FROM base AS builder
WORKDIR /app

# Workspace manifests first for better caching
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY shared/package.json ./shared/package.json
COPY backend/package.json ./backend/package.json
COPY backend/tsconfig.json ./backend/tsconfig.json
COPY backend/shared/package.json ./backend/shared/package.json
COPY backend/shared/tsconfig.json ./backend/shared/tsconfig.json

# Fetch and install dependencies for the whole workspace
RUN pnpm fetch --filter @website/shared --filter ./backend... --filter .
COPY shared ./shared
COPY backend/shared/src ./backend/shared/src
COPY backend/src ./backend/src
COPY tsconfig.json ./tsconfig.json
RUN pnpm install --frozen-lockfile --recursive --filter @website/shared --filter ./backend... --filter . --prod=false

# Build shared and backend
RUN pnpm --filter @website/shared run build
RUN pnpm --filter ./backend... run build

# Prune dev dependencies while keeping workspace layout intact
FROM builder AS pruner
ENV CI=true
RUN pnpm prune --prod

FROM node:${NODE_VERSION}-slim AS runner
ENV NODE_ENV=production
ENV PORT=8080
WORKDIR /app
RUN useradd --create-home --shell /bin/bash appuser

COPY --from=pruner /app/node_modules ./node_modules
COPY --from=pruner /app/backend ./backend
COPY --from=pruner /app/shared ./shared

USER appuser
EXPOSE 8080
WORKDIR /app/backend
CMD ["node", "dist/index.js"]
