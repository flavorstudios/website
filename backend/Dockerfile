# syntax=docker/dockerfile:1
ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-bullseye AS base
ENV PNPM_HOME=/pnpm
ENV PATH="${PNPM_HOME}:${PATH}"
RUN corepack enable && mkdir -p "${PNPM_HOME}" && chmod 0777 "${PNPM_HOME}"
WORKDIR /app

# Install all dependencies and build in a single, consistent workspace rooted at /app
FROM base AS builder
WORKDIR /app

# Workspace manifests first for better caching
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY tsconfig.json ./tsconfig.json
COPY backend/package.json ./backend/package.json
COPY backend/tsconfig.json ./backend/tsconfig.json
COPY shared/package.json ./shared/package.json
COPY shared/tsconfig.json ./shared/tsconfig.json

# Fetch and install dependencies for the required workspaces only
RUN pnpm --workspace-root fetch --filter @website/shared --filter next-backend

# Copy sources needed for the filtered install and builds
COPY shared ./shared
COPY backend ./backend

RUN pnpm --workspace-root install --frozen-lockfile --recursive --filter @website/shared --filter next-backend --prod=false

# Build shared and backend
RUN pnpm --workspace-root --filter @website/shared run build
RUN pnpm --workspace-root --filter next-backend run build

# Prune dev dependencies while keeping workspace layout intact
FROM builder AS pruner
ENV CI=true
RUN pnpm --workspace-root prune --prod --ignore-scripts

FROM node:${NODE_VERSION}-slim AS runner
ENV NODE_ENV=production
ENV PORT=8080
WORKDIR /app
RUN useradd --create-home --shell /bin/bash appuser

COPY --from=pruner /app/node_modules ./node_modules
COPY --from=pruner /app/shared/dist ./shared/dist
COPY --from=pruner /app/shared/package.json ./shared/package.json
COPY --from=pruner /app/backend/dist ./backend/dist
COPY --from=pruner /app/backend/package.json ./backend/package.json

USER appuser
EXPOSE 8080
WORKDIR /app/backend
CMD ["node", "dist/index.js"]
