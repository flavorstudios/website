# syntax=docker/dockerfile:1
ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-bullseye AS base
ENV PNPM_HOME=/pnpm
ENV PATH="${PNPM_HOME}:${PATH}"
RUN corepack enable && mkdir -p "${PNPM_HOME}" && chmod 0777 "${PNPM_HOME}"
WORKDIR /app

FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY shared/package.json ./shared/package.json
RUN pnpm fetch --filter @website/shared --filter .
RUN pnpm install --frozen-lockfile --recursive --filter @website/shared --filter . --prod=false

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/shared/package.json ./shared/package.json
COPY shared ./shared
COPY src ./src
COPY tsconfig.json ./tsconfig.json
RUN pnpm --filter @website/shared run build
RUN pnpm --filter . run build

FROM base AS pruner
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/dist ./dist
RUN pnpm prune --filter . --prod
RUN pnpm prune --filter @website/shared --prod

FROM node:${NODE_VERSION}-slim AS runner
ENV NODE_ENV=production
ENV PORT=8080
WORKDIR /app
RUN useradd --create-home --shell /bin/bash appuser

COPY --from=pruner /app/dist ./dist
COPY --from=pruner /app/package.json ./package.json
COPY --from=pruner /app/node_modules ./node_modules
COPY --from=pruner /app/shared/dist ./shared/dist
COPY --from=pruner /app/shared/package.json ./shared/package.json

USER appuser
EXPOSE 8080
CMD ["node", "dist/index.js"]
