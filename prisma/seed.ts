import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Prisma 7: client must be instantiated with a driver adapter.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Deterministic UUIDs -> every upsert targets a fixed id, so the seed is
// fully idempotent and safe to re-run on every container start.
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

const CURRENCY = "MYR"; // single-currency v1 — seed placeholder
const BLUR =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

const CATEGORIES = [
  { id: id(1), slug: "apparel", name: "Apparel", sortOrder: 1 },
  { id: id(2), slug: "outerwear", name: "Outerwear", sortOrder: 2 },
  { id: id(3), slug: "accessories", name: "Accessories", sortOrder: 3 },
  { id: id(4), slug: "home", name: "Home", sortOrder: 4 },
];

type SeedVariant = {
  sku: string;
  size?: string;
  color?: string;
  stock: number;
  isDefault?: boolean;
};

type SeedProduct = {
  num: number;
  slug: string;
  name: string;
  description: string;
  categorySlug: string;
  price: number;
  compareAt?: number;
  hue: number;
  options: { name: string; values: string[] }[];
  variants: SeedVariant[];
};

const PRODUCTS: SeedProduct[] = [
  {
    num: 10,
    slug: "airflow-tee",
    name: "Airflow Tee",
    description: "Lightweight breathable cotton tee, cut boxy for everyday wear.",
    categorySlug: "apparel",
    price: 5900,
    hue: 152,
    options: [
      { name: "Size", values: ["S", "M", "L"] },
      { name: "Color", values: ["Black", "Sage"] },
    ],
    variants: [
      { sku: "AIB-TEE-S-BLK", size: "S", color: "Black", stock: 25, isDefault: true },
      { sku: "AIB-TEE-M-BLK", size: "M", color: "Black", stock: 18 },
      { sku: "AIB-TEE-L-SGE", size: "L", color: "Sage", stock: 12 },
    ],
  },
  {
    num: 11,
    slug: "daily-oxford",
    name: "Daily Oxford Shirt",
    description: "Crisp woven oxford with a soft collar — office to weekend.",
    categorySlug: "apparel",
    price: 12900,
    compareAt: 15900,
    hue: 210,
    options: [
      { name: "Size", values: ["S", "M", "L"] },
      { name: "Color", values: ["White", "Sky"] },
    ],
    variants: [
      { sku: "AIB-OXF-S-WHT", size: "S", color: "White", stock: 14 },
      { sku: "AIB-OXF-M-WHT", size: "M", color: "White", stock: 20, isDefault: true },
      { sku: "AIB-OXF-L-SKY", size: "L", color: "Sky", stock: 9 },
    ],
  },
  {
    num: 12,
    slug: "nimbus-bomber",
    name: "Nimbus Bomber Jacket",
    description: "Water-resistant bomber with ribbed cuffs and a matte finish.",
    categorySlug: "outerwear",
    price: 24900,
    hue: 96,
    options: [
      { name: "Size", values: ["M", "L", "XL"] },
      { name: "Color", values: ["Olive"] },
    ],
    variants: [
      { sku: "AIB-BMB-M-OLV", size: "M", color: "Olive", stock: 8, isDefault: true },
      { sku: "AIB-BMB-L-OLV", size: "L", color: "Olive", stock: 6 },
      { sku: "AIB-BMB-XL-OLV", size: "XL", color: "Olive", stock: 4 },
    ],
  },
  {
    num: 13,
    slug: "canvas-tote",
    name: "Everyday Canvas Tote",
    description: "Heavyweight 16oz canvas tote with an interior zip pocket.",
    categorySlug: "accessories",
    price: 4900,
    hue: 35,
    options: [{ name: "Color", values: ["Natural", "Ink"] }],
    variants: [
      { sku: "AIB-TOT-NAT", color: "Natural", stock: 30, isDefault: true },
      { sku: "AIB-TOT-INK", color: "Ink", stock: 22 },
    ],
  },
  {
    num: 14,
    slug: "terra-mug",
    name: "Terra Ceramic Mug",
    description: "Hand-glazed 350ml stoneware mug with a matte speckled finish.",
    categorySlug: "home",
    price: 3900,
    hue: 12,
    options: [{ name: "Color", values: ["Clay", "Cream"] }],
    variants: [
      { sku: "AIB-MUG-CLY", color: "Clay", stock: 40, isDefault: true },
      { sku: "AIB-MUG-CRM", color: "Cream", stock: 35 },
    ],
  },
  {
    num: 15,
    slug: "foldover-pouch",
    name: "Foldover Pouch",
    description: "Water-resistant foldover pouch for cables, toiletries, or docs.",
    categorySlug: "accessories",
    price: 2900,
    hue: 160,
    options: [{ name: "Color", values: ["Sage", "Black"] }],
    variants: [
      { sku: "AIB-PCH-SGE", color: "Sage", stock: 50, isDefault: true },
      { sku: "AIB-PCH-BLK", color: "Black", stock: 45 },
    ],
  },
];

async function main() {
  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, sortOrder: c.sortOrder },
      create: c,
    });
  }

  for (const p of PRODUCTS) {
    const productId = id(p.num);
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { name: p.name, description: p.description, status: "active" },
      create: {
        id: productId,
        slug: p.slug,
        name: p.name,
        description: p.description,
        status: "active",
      },
    });

    const cat = CATEGORIES.find((c) => c.slug === p.categorySlug)!;
    await prisma.productCategory.upsert({
      where: { productId_categoryId: { productId, categoryId: cat.id } },
      update: {},
      create: { productId, categoryId: cat.id },
    });

    // options + values (deterministic ids, indexed for variant wiring)
    const valueIds = new Map<string, string>();
    let valueCounter = 0;
    for (const [oi, opt] of p.options.entries()) {
      const optionId = id(p.num * 100 + oi);
      await prisma.productOption.upsert({
        where: { id: optionId },
        update: { name: opt.name, position: oi },
        create: { id: optionId, productId, name: opt.name, position: oi },
      });
      for (const [vi, v] of opt.values.entries()) {
        const valueId = id(4000 + p.num * 100 + valueCounter++);
        valueIds.set(`${opt.name}:${v}`, valueId);
        await prisma.productOptionValue.upsert({
          where: { id: valueId },
          update: { value: v, position: vi },
          create: { id: valueId, optionId, value: v, position: vi },
        });
      }
    }

    // media: one placeholder SVG per product
    const media = {
      id: id(6000 + p.num),
      url: `/images/${p.slug}.svg`,
      type: "image" as const,
      width: 1200,
      height: 1200,
      blurDataUrl: BLUR,
      alt: p.name,
    };
    await prisma.media.upsert({ where: { id: media.id }, update: media, create: media });
    await prisma.productMedia.upsert({
      where: { productId_mediaId: { productId, mediaId: media.id } },
      update: { role: "featured", sortOrder: 0 },
      create: { productId, mediaId: media.id, role: "featured", sortOrder: 0 },
    });

    // variants + option-value wiring
    for (const [vi, v] of p.variants.entries()) {
      const variantId = id(8000 + p.num * 100 + vi);
      const variantData = {
        priceCents: p.price,
        compareAtPriceCents: p.compareAt ?? null,
        stockQuantity: v.stock,
        isDefault: v.isDefault ?? false,
      };
      await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: variantData,
        create: { id: variantId, productId, sku: v.sku, ...variantData },
      });
      const pairs = [
        { optionName: "Size", value: v.size },
        { optionName: "Color", value: v.color },
      ];
      for (const pair of pairs) {
        if (!pair.value) continue;
        const optionValueId = valueIds.get(`${pair.optionName}:${pair.value}`);
        if (!optionValueId) throw new Error(`seed: missing option value ${pair.optionName}:${pair.value}`);
        await prisma.variantOptionValue.upsert({
          where: { variantId_optionValueId: { variantId, optionValueId } },
          update: {},
          create: { variantId, optionValueId },
        });
      }
    }
  }

  await prisma.discountCode.upsert({
    where: { code: "WELCOME10" },
    update: { active: true },
    create: {
      id: id(100),
      code: "WELCOME10",
      type: "percentage",
      value: 1000, // basis points -> 10%
      minSubtotalCents: 5000,
      perEmailLimit: 1,
      active: true,
    },
  });

  const reviews = [
    { n: 110, name: "Nadia K.", rating: 5, body: "Fabric is airy and holds shape after washing. True to size." },
    { n: 111, name: "Imran H.", rating: 4, body: "Great cut and colour. Wish there were more size options." },
  ];
  for (const r of reviews) {
    await prisma.review.upsert({
      where: { id: id(r.n) },
      update: { body: r.body, rating: r.rating, status: "approved" },
      create: {
        id: id(r.n),
        productId: id(PRODUCTS[0].num),
        displayName: r.name,
        rating: r.rating,
        body: r.body,
        status: "approved",
      },
    });
  }

  console.log(
    `Seed complete: ${CATEGORIES.length} categories, ${PRODUCTS.length} products, WELCOME10 discount, ${reviews.length} reviews`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });