# syntax=docker/dockerfile:1
ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-bullseye AS base
ENV PNPM_HOME=/pnpm
RUN corepack enable && mkdir -p "$PNPM_HOME" && chmod 0777 "$PNPM_HOME"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /app

FROM base AS deps
# Workspace manifests
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
# Package-specific manifests
COPY backend/package.json backend/tsconfig.json ./backend/
COPY shared/package.json shared/tsconfig.json ./shared/
# Install all dependencies needed for build
RUN pnpm install --frozen-lockfile --filter "./backend..." --filter "@website/shared..." --prod=false

FROM deps AS build
COPY shared/src ./shared/src
COPY backend/src ./backend/src
RUN pnpm --filter @website/shared run build
RUN pnpm --filter ./backend run build

FROM base AS pruner
COPY --from=build /app /app
RUN pnpm prune --filter ./backend --prod

FROM node:${NODE_VERSION}-slim AS runner
ENV NODE_ENV=production
ENV PORT=8080
WORKDIR /app
# Runtime files
COPY --from=pruner /app/backend/package.json ./backend/package.json
COPY --from=pruner /app/backend/node_modules ./backend/node_modules
COPY --from=pruner /app/backend/dist ./backend/dist
COPY --from=pruner /app/shared/package.json ./shared/package.json
COPY --from=pruner /app/shared/dist ./shared/dist
EXPOSE 8080
WORKDIR /app/backend
CMD ["node", "dist/index.js"]