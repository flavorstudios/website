syntax=docker/dockerfile:1

FROM node:22-bullseye AS base
ENV PNPM_HOME=/pnpm
RUN corepack enable && mkdir -p $PNPM_HOME && chmod 0777 $PNPM_HOME
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY backend/package.json backend/tsconfig.json ./backend/
COPY shared/package.json shared/tsconfig.json ./shared/
RUN pnpm install --frozen-lockfile --filter ./backend... --prod=false

FROM deps AS build
COPY shared/src ./shared/src
RUN pnpm --filter @website/shared run build
COPY backend/src ./backend/src
RUN pnpm --filter ./backend... run build

FROM base AS prod-deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/
COPY --from=build /app/shared/dist ./shared/dist
RUN pnpm install --frozen-lockfile --filter ./backend... --prod

FROM node:22-slim AS runner
ENV NODE_ENV=production
ENV PORT=8080
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/backend ./backend
COPY --from=build /app/shared ./shared
EXPOSE 8080
WORKDIR /app/backend
CMD ["node", "dist/index.js"]
