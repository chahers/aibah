<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# aibah — E-commerce Store (guest checkout)

Stack: Next.js 16 (App Router, `src/app`) · React 19 · TypeScript · Tailwind 4 · Prisma 7 (pinned 7.10.0, stable — verify generator config against installed docs before use) · PostgreSQL (local dev) · Stripe · Resend. No custom admin UI in v1 — Prisma Studio + Stripe Dashboard instead.

## Conventions (read before writing DB/query code)

- Money is **integer minor units**: `*_cents` columns + `currency char(3)`. Never floats, never `Decimal`.
- `order_items` rows are **snapshots** (product name, sku, options, unit price, image URL). Never join the catalog to render historical orders.
- Guests have **no accounts**. Guest identity = `orders.email` + `orders.order_number` + `orders.guest_access_token` (powers the "view order" link).
- Emails are stored **trimmed and lowercase** everywhere (future account linking depends on this).
- Media: DB rows store **URL/key + width + height + blurDataURL only**. Image bytes live on disk/object storage (`sharp`-processed), never in Postgres.
- Products are **archived via `status`**, never hard-deleted — order history references them. `order_items.variant_id` is nullable, `ON DELETE SET NULL`.
- Stock: decrement with a **conditional update** (`WHERE stock_quantity >= n`) inside the payment-webhook transaction; order becomes `paid` **only** via verified webhook, never via client redirect.
- **Idempotency**: `webhook_events.event_id` is UNIQUE — provider retries must not double-apply. Order creation is transactional.
- Carts: httpOnly `cart_token` cookie (SameSite=Lax, 30 days); `carts.expires_at` + periodic cleanup marks carts `abandoned`/`expired`.

## Schema — 24 tables (source of truth: `prisma/schema.prisma`)

**Catalog & media (9)**
- `products` — slug (unique), name, description, `status(draft|active|archived)`
- `product_options` — product_id FK, name ("Size"), position
- `product_option_values` — option_id FK, value ("M"), position
- `product_variants` — product_id FK, sku (unique), price_cents, compare_at_price_cents, stock_quantity, low_stock_threshold, weight_grams, is_default, active
- `variant_option_values` — (variant_id, option_value_id) PK — which values compose a variant
- `categories` — slug (unique), name, parent_id (self FK, nullable), sort_order
- `product_categories` — (product_id, category_id) PK
- `media` — url/key, type(image|video), width, height, blur_data_url, alt, size_bytes
- `product_media` — (product_id, media_id), role(gallery|featured), sort_order

**Cart & orders (8)**
- `carts` — token (unique, cookie-bound), email?, currency, `status(active|converted|abandoned|expired)`, expires_at
- `cart_items` — cart_id FK, variant_id FK, quantity (CHECK >0, ≤99), UNIQUE(cart_id, variant_id)
- `orders` — order_number (unique, e.g. `AIB-10001`), cart_id?, email, `status(pending|paid|fulfilled|delivered|closed|cancelled|refunded)`, currency, subtotal/discount/shipping/tax/total_cents, discount_code?, guest_access_token (unique), placed_at, internal_notes
- `order_items` — order_id FK, variant_id? (SET NULL), snapshots: product_name, variant_options, sku, image_url, unit_price_cents, quantity, line_total_cents
- `order_addresses` — order_id FK, `type(shipping|billing)`, name, phone, line1, line2, city, region, postal_code, country char(2); UNIQUE(order_id, type)
- `payments` — order_id FK, provider, provider_ref, `status(pending|processing|succeeded|failed|refunded)`, amount_cents, currency, error_message; UNIQUE(provider, provider_ref)
- `refunds` — payment_id FK, amount_cents >0, reason, provider_ref (unique)
- `shipments` — order_id FK, carrier, tracking_number, `status(pending|in_transit|delivered|returned)`, shipped_at, delivered_at

**Marketing (2)**
- `discount_codes` — code (unique, stored UPPERCASE), `type(percentage|fixed|free_shipping)`, value (percentage → basis points; fixed → cents), min_subtotal_cents, max_uses, used_count, per_email_limit, starts_at, ends_at, active
- `discount_redemptions` — discount_code_id FK, order_id FK, email; UNIQUE(order_id, discount_code_id); index(email)

**Engagement & ops (5)**
- `reviews` — product_id FK, display_name, rating (1–5), body, `status(pending|approved|rejected)`, order_item_id? (verified purchase)
- `review_media` — (review_id, media_id)
- `webhook_events` — provider, event_id (unique), type, payload (jsonb), `status(received|processed|failed)`, error, received_at, processed_at
- `email_log` — to_email, template, subject, `status(queued|sent|failed)`, provider_ref, error
- `analytics_events` — type(page_view|product_view|add_to_cart|purchase), session_token?, product_id?, order_id?, metadata (jsonb), created_at

## Roadmap — phase-by-phase reference

Sequential phases. Status legend: **DONE** = implemented; **code-complete** = written + validated locally (typecheck/build) but not yet run in Docker elsewhere; **NEXT** = in progress; **PLANNED** = not started. Required external keys are called out per phase.

### Phase 0 — Provisioning & toolchain (DONE)

- **Decision**: runtime runs in Docker Compose; host (Windows, Node v24, npm 11) is tooling-only.
- `docker-compose.yml` — 3 services: `db` (postgres:17-alpine, healthcheck, persistent `aibah_pgdata` volume, published `127.0.0.1:5432`), `web` (app; runs `prisma migrate deploy` + `prisma db seed` then `next start` on every container start, non-root `nextjs` user), `studio` (Prisma Studio on `127.0.0.1:5555`).
- Multi-stage `Dockerfile` — `deps` (full install) → `proddeps` (`npm ci --omit=dev`) → `build` (`prisma generate` + `next build`, no DB needed at build time) → `runner`. `openssl` installed (Prisma engine requirement). Runtime `DATABASE_URL` points at the `db` service.
- Prisma pinned to **7.10.0** (`prisma`, `@prisma/client`, `@prisma/adapter-pg`). Do not bump to 8.0.0-rc without re-verifying generator/config conventions.
- `.env` / `.env.example` — `DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`. Never commit real secrets.
- package.json scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `db:up`, `db:down`, `db:migrate`, `db:seed`, `db:studio`, `db:reset`.
- Acceptance: `docker compose up --build` → db healthy; app on `http://localhost:3000`; Studio on `http://localhost:5555`; host-side `npm run dev` reaches Postgres on `127.0.0.1:5432`.

### Phase 1 — Foundation: schema, migrations, seed, client (DONE, code-complete)

- `prisma/schema.prisma` — all **24 models + 13 enums**; snake_case columns via `@map`/`@@map`; generator `prisma-client`, `output = "../src/generated/prisma"`.
- `prisma.config.ts` — Prisma 7 style: `defineConfig` + `import "dotenv/config"` + `env("DATABASE_URL")` + `migrations.path` + `migrations.seed = "tsx prisma/seed.ts"`. **Prisma 7 requires a driver adapter at runtime** (`@prisma/adapter-pg`); no automatic `.env` loading (hence the explicit dotenv import).
- `prisma/migrations/20260901000000_init/migration.sql` — generated via `prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script -o`, then **custom SQL appended**: `order_number_seq` (start 10001) + CHECK constraints (`cart_items.quantity` 1–99; `order_items.quantity` >0; `product_variants.price_cents` and `stock_quantity` ≥0; `orders.total_cents`, `payments.amount_cents` ≥0; `refunds.amount_cents` >0). Never edit an applied migration — add new ones.
- `prisma/seed.ts` — **fully idempotent** (deterministic UUIDs + upserts; safe on every container start): 4 categories, 6 products (options → values → variants, SKUs, stock, prices in cents, default variant), 1 `media` + `product_media` row per product (placeholder SVG in `/public/images`), `WELCOME10` percentage (1000 bps, min subtotal 5000, per-email limit 1), 2 approved reviews. Seed currency is `MYR` placeholder — change in the seed if needed.
- `src/lib/db.ts` — Prisma singleton with `PrismaPg` adapter; cached on `globalThis` in dev (hot-reload safe).
- Generated client `src/generated/` is **git-ignored** — regenerate via `npx prisma generate` (Docker builds do it automatically).
- Acceptance: `prisma validate` + `npx prisma generate` clean; fresh DB → `prisma migrate deploy` + `prisma db seed` → 24 populated tables; `npx prisma studio` shows all tables; `npm run typecheck` + `npm run build` green.

### Phase 2 — Data layer & catalog UI (NEXT)

- **Before any code**: read the installed Next.js 16 docs in `node_modules/next/dist/docs/` (breaking changes — layouts/pages, params, image, caching/model). Do not rely on training data for Next 16.
- Query helpers — keep business logic in reusable query modules, **not** in server actions or components (future admin UI will call the same helpers):
  - `src/lib/queries/catalog.ts` — `listActiveProducts()`, `getProductBySlug(slug)` (include variants, option values, featured + gallery media, categories, approved reviews), `listCategories()`, `listProductsByCategory(slug)`.
  - `src/lib/queries/cart.ts` — `getOrCreateCart(token)`, `getCartWithItems(token)` (variant + product snapshot), `addToCart`, `updateCartItem`, `removeCartItem`. Totals always integer cents.
  - `src/lib/utils/money.ts` — cents ↔ formatted currency (seed placeholder `MYR`), `Intl.NumberFormat`.
- Pages (server components rendering the seeded catalog):
  - `/` — hero + product grid (featured media, name, price).
  - `/products` — full listing, optional `?category=` filter.
  - `/products/[slug]` — PDP: gallery, description, variant selectors (size/color), stock status, price. Add-to-cart is wired in Phase 4.
  - Root layout + header/footer (nav from categories, cart link placeholder).
- **Critical**: the Docker image builds WITHOUT a database → catalog pages must be dynamically rendered. Never run a Prisma query at static-generation/build time; use `export const dynamic = "force-dynamic"` on data pages (or fetch on request only). An accidental `findMany` during `next build` will fail the Docker build.
- Acceptance: `/`, `/products`, `/products/[slug]` render seeded catalog data; typecheck + build green; pages still build inside the Docker image (no DB at build time).

### Phase 3 — Media pipeline (PLANNED)

- Upload route (admin-token protected, env-gated) → `sharp` processing → variants (webp/avif, responsive sizes) + tiny blur placeholder → bytes stored on disk/object storage (never in Postgres) and `blur_data_url` derived.
- Write `media` row (url/key, type, width, height, blur_data_url, alt, size_bytes) + `product_media` rows (role `featured`/`gallery`, sort_order).
- Serve via `next/image` — local `/images` if disk-backed, `remotePatterns` in `next.config.ts` if external storage.
- Replace seeded SVG placeholders with real processed images on product pages.
- Acceptance: upload → responsive images with blur-up; assets not stored in Postgres; `next/image` security config correct.

### Phase 4 — Cart & checkout (PLANNED — needs Stripe keys)

- Cart: httpOnly `cart_token` cookie (SameSite=Lax, 30 days); server actions add/update/remove + merge on existing token; `carts.expires_at` + periodic cleanup (cron/job) marks carts `abandoned`/`expired`; `cart_items` UNIQUE(cart_id, variant_id) merges rows; quantity CHECK 1–99.
- Checkout flow (server actions, transactional):
  1. Validate cart (stock, active variants, live prices) — snapshot prices at order time.
  2. Create `orders` (`pending`) + `order_items` (snapshots) + `order_addresses` (shipping/billing) in **one transaction**; `guest_access_token` (crypto random, unique); `order_number` = `AIB-` + `nextval('order_number_seq')`.
  3. Create Stripe PaymentIntent server-side (amount from DB, never client); `payments` row — `succeeded` only ever via webhook.
- Stripe webhook `POST /api/webhooks/stripe`:
  1. Verify signature with `stripe.webhooks.constructEvent`.
  2. Idempotency: insert `webhook_events` (`event_id` UNIQUE) — a duplicate means "already processed", return 200.
  3. On `payment_intent.succeeded`: mark order `paid` + payment `succeeded` + set `placed_at`; mark cart `converted`.
  4. **Stock decrement inside the same transaction** via conditional update (`UPDATE product_variants SET stock_quantity = stock_quantity - n WHERE id = … AND stock_quantity >= n`) — fail loudly on insufficient stock. Order becomes `paid` ONLY via verified webhook, never via client redirect.
- Errors recorded on `webhook_events.error`; provider retries are made idempotent by the UNIQUE `event_id`.
- Acceptance: guest adds to cart → checkout → pays (Stripe test mode) → order `paid`, stock decremented exactly once, webhook replay (resending the same event) applies nothing twice. Requires `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` in `.env`.

### Phase 5 — Post-order: emails + order lookup (PLANNED — needs Resend key)

- Emails via Resend; every send logged to `email_log` (`queued` → `sent`/`failed`, provider_ref, subject, template). Templates: order confirmation/receipt (with view-order link via `guest_access_token`), shipping notification, delivery update.
- `/orders/lookup` — form: order number + email → order status page (items, totals, addresses, payment, shipment). No auth — this IS the guest "account".
- `/orders/[orderNumber]?t=<guest_access_token>` — tokenized deep link from email; never expose order data without the order number OR a valid token.
- v1 fulfillment: `shipments` rows (carrier, tracking_number, status, shipped_at/delivered_at) updated via Prisma Studio.
- Acceptance: guest receives receipt, follows the token link, checks status with number + email only. Requires `RESEND_API_KEY` in `.env`.

### Phase 6 — Growth: discounts, reviews, analytics (PLANNED)

- Discounts: apply at checkout — validate (active, `starts_at`/`ends_at`, `min_subtotal_cents`, `max_uses`, `per_email_limit`), compute `discount_cents` (percentage → basis points; fixed → cents; `free_shipping` → set shipping to 0), record a `discount_redemptions` row inside the order transaction, increment `used_count`. Codes stored UPPERCASE; UNIQUE(order_id, discount_code_id).
- Reviews: submit (display_name, rating 1–5, body; optional images via `review_media`); status `pending` → `approved`/`rejected` (moderation via Prisma Studio in v1); verified purchase links `order_item_id`; approved reviews render on the PDP.
- Analytics: log `analytics_events` rows (`page_view`, `product_view`, `add_to_cart`, `purchase`) with optional `session_token`, `product_id`, `order_id`, `metadata` JSONB; lightweight instrumentation (server actions/route handlers) — no external analytics dependency in v1.
- Acceptance: discount applies once per order+email with all limits honored; reviews appear only after approval; `analytics_events` rows accumulate on the described events.

### Using this roadmap

- Status of each phase is kept current as work proceeds (DONE / code-complete / NEXT / PLANNED).
- When starting a phase, read the relevant installed Next.js 16 docs first (`node_modules/next/dist/docs/`) — APIs in this version differ from training data.
- Business logic belongs in `src/lib/queries/*` helpers so the future admin UI and server actions share it.
- Milestones needing human keys: Phase 4 (Stripe test keys), Phase 5 (Resend API key).

Non-goals for v1: no users/auth, no per-user address book, no wishlists, no multi-currency, no multi-warehouse inventory, no custom admin UI, no external search engine (Postgres queries first).

## Future: admin system (decided path)

- **Now**: lowercase emails; `orders.internal_notes`; keep business logic in reusable query helpers; `pg_dump` backup habit.
- **Later (clean migrations, no rework)**: `admin_users` + `sessions` (separate from any future customer `users`), `audit_log` (actor, action, entity, diff), `inventory_movements` ledger, `store_settings` key/value, then RBAC only if staff grows.
- Bridge: Prisma Studio + Stripe Dashboard covers v1 operations.

## Environment notes

- **Runtime = Docker Compose** (decided at Phase 0): `docker compose up --build` starts Postgres 17 (with healthcheck + persistent `aibah_pgdata` volume), the web app (auto `prisma migrate deploy` + idempotent seed on every start, non-root user), and Prisma Studio on port 5555. Postgres is published on `127.0.0.1:5432` so host-side `npm run dev` / `npm run db:studio` reach it via localhost.
- Host machine: Windows; Node v24, npm 11 — host tooling only; all runtime deps ship inside the image.
- After a fresh host-side clone + `npm install`, run `npx prisma generate` once before `npm run dev` / `npm run typecheck` (`src/generated` is git-ignored; Docker builds generate automatically).
- Secrets via `.env` (never commit): `DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`.

## Commands (current — what is set up now)

### Database & Prisma

| Command | What it does |
|---|---|
| `npm run db:up` | (Docker) `docker compose up -d --build` — full stack: Postgres 17 + web + Studio |
| `npm run db:down` | (Docker) `docker compose down` — stop containers (volume persists) |
| `npm run db:embedded:start` | Boot embedded Postgres locally at `127.0.0.1:5432` (creates `.pgdata/` + `aibah` DB on first run). No Docker/admin needed. ⚠️ Keeps the terminal occupied while running. |
| `npm run db:embedded:stop` | Stop embedded Postgres (data persists in `.pgdata/`) |
| `npm run db:embedded:status` | Check if embedded Postgres is running |
| `npm run db:embedded:verify` | List all tables in `aibah` + row counts |
| `npx prisma migrate deploy` | Apply pending migrations to the DB pointed at by `DATABASE_URL` |
| `npx prisma migrate dev` | Dev workflow: create + apply new migration from schema changes (needs shadow DB) |
| `npx prisma generate` | Regenerate the typed client into `src/generated/prisma` (git-ignored; required after `npm install` on a fresh clone) |
| `npx prisma validate` | Validate `schema.prisma` + `prisma.config.ts` |
| `npm run db:seed` | `prisma db seed` — idempotent seed (deterministic UUIDs + upserts; safe to re-run) |
| `npm run db:studio` | Open Prisma Studio GUI at `http://localhost:5555` (v1 admin) |
| `npm run db:reset` | Drop + re-apply migrations + seed (`--force`; only for dev) |
| `npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script -o <path>` | Regenerate initial migration SQL (Prisma 7 syntax) |

### Frontend (Next.js 16, App Router)

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server (`next dev`) — hot reload, reads `.env` |
| `npm run build` | Production build (`next build`) — must pass with **no DB connection** (catalog pages are dynamic) |
| `npm run start` | Serve the production build (`next start`) — what the Docker `web` service runs |
| `npm run lint` | ESLint over the codebase |
| `npm run typecheck` | `tsc --noEmit` over all TS/TSX (includes generated Prisma client) |

### Backend (what exists today)

- There is **no separate backend service** — the "backend" is Next.js itself: **Server Components** (pages) + **Server Actions** (mutations, Phase 4+) + **Route Handlers** (`/api/*`, webhook in Phase 4). Future phases add `src/app/api/webhooks/stripe`, cart/checkout server actions, and `/orders/*`.
- DB access layer (exists now): `src/lib/db.ts` (Prisma singleton) — import `{ prisma }` from it; generated client at `src/generated/prisma/`.
- Business-logic query helpers land in `src/lib/queries/*` in **Phase 2** (catalog + cart) — server actions and the future admin share these; do not put queries in components/actions directly.
- No server-side tests/runner configured yet.
