# AIBAH storefront

React 18 + TypeScript + Tailwind CSS v4 + React Router, built with Vite.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build to /dist
```

## Pages

| Route | File |
|---|---|
| `/` | `src/pages/Home.tsx` |
| `/shop` | `src/pages/Shop.tsx` |
| `/product/:handle` | `src/pages/Product.tsx` |
| `/about` | `src/pages/About.tsx` |
| `/faq` (`/faq#size-chart`) | `src/pages/Faq.tsx` |

Contact, Track Your Order, Care Instructions, Terms and Account are placeholder routes (`src/pages/Placeholder.tsx`).

## Content to edit

- Products, prices, per-size stock: `src/data/products.ts` (set a size to `true` to put it back on sale)
- FAQ answers and size chart: `src/data/faq.ts` (answers and measurements are drafts/placeholders)
- Brand tokens and fonts: `src/index.css` (`@theme`) and `index.html`
- The newsletter form and the Check out button are not connected to a backend yet

## Images

`public/images/*` were cropped from the design screenshots (text overlays and sold-out badges removed).
Swap in the original photography using the same filenames. `fabric.webp` is a generated twill texture.

## Deploying

Uses `BrowserRouter`, so configure your host to serve `index.html` for all routes (SPA fallback).
