# syntax=docker/dockerfile:1
FROM node:22 AS base
ENV PNPM_HOME=/pnpm
RUN corepack enable && mkdir -p $PNPM_HOME && chmod 0777 $PNPM_HOME
ENV PATH="$PNPM_HOME:$PATH"

FROM base AS deps
WORKDIR /app
COPY backend/pnpm-lock.yaml backend/package.json ./backend/
COPY shared ./shared
RUN cd backend && pnpm install --frozen-lockfile --prod=false

FROM deps AS build
WORKDIR /app
COPY backend/tsconfig.json ./backend/
COPY backend/src ./backend/src
RUN cd backend && pnpm run build && pnpm prune --prod

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/backend/dist ./dist
COPY --from=deps /app/backend/node_modules ./node_modules
COPY backend/package.json ./package.json
EXPOSE 8080
ENTRYPOINT ["node","dist/index.js"]