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

## Roadmap (acceptance checks)

1. **Foundation** — Prisma install, local Postgres, full migration, seed → `prisma migrate dev` clean; Studio shows all 24 tables; `npm run build` green
2. **Data layer** — `src/lib/db.ts` singleton + typed catalog/cart query helpers → pages render seeded catalog
3. **Media** — upload route, `sharp` processing, `media` rows, `next/image` serving → responsive images with blur placeholders
4. **Cart & checkout** — cookie cart, server actions, Stripe, transactional order creation → guest buys end-to-end; inventory decrements once; webhook replay is idempotent
5. **Post-order** — emails (logged to `email_log`), `/orders/lookup` (number + email), shipment tracking records → guest checks status with number + email
6. **Growth** — discounts UI/validation, review submission + moderation, analytics events

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
