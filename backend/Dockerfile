# syntax=docker/dockerfile:1
ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-bullseye AS base
ENV PNPM_HOME=/pnpm
ENV PATH="${PNPM_HOME}:${PATH}"
RUN corepack enable && mkdir -p "${PNPM_HOME}" && chmod 0777 "${PNPM_HOME}"
WORKDIR /app

# Install all dependencies and build within the monorepo workspace
FROM base AS builder
WORKDIR /app

# Workspace manifests first for better caching
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY tsconfig.json ./tsconfig.json
COPY backend/package.json ./backend/package.json
COPY backend/tsconfig.json ./backend/tsconfig.json
COPY shared/package.json ./shared/package.json
COPY shared/tsconfig.json ./shared/tsconfig.json

# Fetch dependencies for the backend and shared workspaces
RUN pnpm --workspace-root fetch --filter @website/shared --filter next-backend

# Copy source code
COPY shared ./shared
COPY backend ./backend

# Install all workspace dependencies needed for the build
RUN pnpm --workspace-root install --frozen-lockfile --recursive --filter @website/shared --filter next-backend --prod=false

# Build shared and backend packages
RUN pnpm --workspace-root --filter @website/shared run build
RUN pnpm --workspace-root --filter next-backend run build

# Prune dev dependencies while keeping the workspace layout intact
FROM builder AS pruner
ENV CI=true
RUN pnpm --workspace-root prune --prod --ignore-scripts

FROM node:${NODE_VERSION}-slim AS runner
ENV NODE_ENV=production
ENV PORT=8080
WORKDIR /app
RUN useradd --create-home --shell /bin/bash appuser

COPY --from=pruner /app/node_modules ./node_modules
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/backend ./backend

USER appuser
WORKDIR /app/backend
EXPOSE 8080
CMD ["node", "dist/index.js"]
