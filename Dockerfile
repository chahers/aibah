# syntax=docker/dockerfile:1

FROM node:24-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
# openssl is required by Prisma engine binaries on debian-slim
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# ---- full dependencies (build toolchain: typescript, tailwind, eslint) ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ---- production-only deps (next, prisma CLI, adapter-pg, pg, tsx, dotenv) ----
FROM base AS proddeps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# ---- build: generate Prisma client + next build (no DB needed at build time) ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate \
  && npm run build

# ---- runtime ----
FROM base AS runner
ENV NODE_ENV=production
COPY --from=proddeps /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/src ./src
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/next.config.ts ./next.config.ts
COPY --from=build /app/tsconfig.json ./tsconfig.json
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json
RUN useradd --uid 1001 --create-home nextjs \
  && chown -R nextjs:node /app
USER nextjs
EXPOSE 3000
# migrations are applied and the (idempotent) seed runs on every container start;
# `migrate deploy` skips already-applied migrations, so restarts are safe.
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && npm run start"]