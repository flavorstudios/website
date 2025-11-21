# syntax=docker/dockerfile:1
ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-bullseye AS base
ENV PNPM_HOME=/pnpm
ENV PATH="${PNPM_HOME}:${PATH}"
RUN corepack enable && mkdir -p "${PNPM_HOME}" && chmod 0777 "${PNPM_HOME}"
WORKDIR /app

FROM base AS deps
# Workspace manifests
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
# Package specific manifests
COPY backend/package.json ./backend/package.json
COPY shared/package.json ./shared/package.json
# Pre fetch for better cache reuse
RUN pnpm fetch --filter @website/shared --filter ./backend...
# Install workspace deps needed to build backend and shared
RUN pnpm install --frozen-lockfile --recursive --filter @website/shared --filter ./backend... --prod=false

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/package.json ./backend/package.json
COPY --from=deps /app/shared/package.json ./shared/package.json
COPY shared ./shared
COPY backend ./backend
RUN pnpm --filter @website/shared run build
RUN pnpm --filter ./backend... run build

FROM base AS pruner
# Workspace manifests are needed for prune
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/shared ./shared
RUN pnpm prune --filter ./backend... --prod
RUN pnpm prune --filter @website/shared --prod

FROM node:${NODE_VERSION}-slim AS runner
ENV NODE_ENV=production
ENV PORT=8080
WORKDIR /app
RUN useradd --create-home --shell /bin/bash appuser

COPY --from=pruner /app/backend/dist ./backend/dist
COPY --from=pruner /app/backend/package.json ./backend/package.json
COPY --from=pruner /app/backend/node_modules ./backend/node_modules
COPY --from=pruner /app/shared/dist ./shared/dist
COPY --from=pruner /app/shared/package.json ./shared/package.json

USER appuser
EXPOSE 8080
CMD ["node", "backend/dist/index.js"]
