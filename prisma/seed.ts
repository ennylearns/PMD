import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const CATEGORIES = [
  {
    name: "T-Shirts",
    slug: "t-shirts",
    description: "Premium oversized tees engineered for the streets.",
  },
  {
    name: "Joggers",
    slug: "joggers",
    description: "Tactical comfort. Built to move, designed to dominate.",
  },
  {
    name: "New Drops",
    slug: "new-drops",
    description: "Latest releases. Limited runs. No restocks.",
  },
];

const PRODUCTS = [
  {
    name: "Obsidian Core Tee",
    slug: "obsidian-core-tee",
    description:
      "The foundation of every PMD fit. Heavyweight 280gsm cotton, oversized cut, embossed diamond logo on chest. Built to last under pressure.",
    price: 15000,
    categorySlug: "t-shirts",
    isFeatured: true,
    images: ["/products/tshirt-black.png"],
    variants: [
      { color: "Black", size: "S", sku: "OCT-BLK-S", stock: 25 },
      { color: "Black", size: "M", sku: "OCT-BLK-M", stock: 40 },
      { color: "Black", size: "L", sku: "OCT-BLK-L", stock: 35 },
      { color: "Black", size: "XL", sku: "OCT-BLK-XL", stock: 20 },
      { color: "White", size: "S", sku: "OCT-WHT-S", stock: 15 },
      { color: "White", size: "M", sku: "OCT-WHT-M", stock: 30 },
      { color: "White", size: "L", sku: "OCT-WHT-L", stock: 25 },
      { color: "White", size: "XL", sku: "OCT-WHT-XL", stock: 10 },
    ],
  },
  {
    name: "Crimson Pressure Tee",
    slug: "crimson-pressure-tee",
    description:
      "Blood, sweat, diamonds. Dark maroon heavyweight tee with bold front graphic. The statement piece for those who refuse to fold.",
    price: 18000,
    categorySlug: "t-shirts",
    isFeatured: true,
    images: ["/products/tshirt-red.png"],
    variants: [
      { color: "Maroon", size: "S", sku: "CPT-MRN-S", stock: 12 },
      { color: "Maroon", size: "M", sku: "CPT-MRN-M", stock: 20 },
      { color: "Maroon", size: "L", sku: "CPT-MRN-L", stock: 18 },
      { color: "Maroon", size: "XL", sku: "CPT-MRN-XL", stock: 8 },
    ],
  },
  {
    name: "Ghost Diamond Tee",
    slug: "ghost-diamond-tee",
    description:
      "Clean. Minimal. Lethal. White heavyweight tee with tonal diamond graphic that only reveals itself in motion. For the ones who move in silence.",
    price: 16500,
    categorySlug: "t-shirts",
    isFeatured: false,
    images: ["/products/tshirt-white.png"],
    variants: [
      { color: "White", size: "S", sku: "GDT-WHT-S", stock: 20 },
      { color: "White", size: "M", sku: "GDT-WHT-M", stock: 35 },
      { color: "White", size: "L", sku: "GDT-WHT-L", stock: 30 },
      { color: "White", size: "XL", sku: "GDT-WHT-XL", stock: 15 },
      { color: "Black", size: "S", sku: "GDT-BLK-S", stock: 10 },
      { color: "Black", size: "M", sku: "GDT-BLK-M", stock: 22 },
      { color: "Black", size: "L", sku: "GDT-BLK-L", stock: 18 },
      { color: "Black", size: "XL", sku: "GDT-BLK-XL", stock: 5 },
    ],
  },
  {
    name: "Stealth Runner Joggers",
    slug: "stealth-runner-joggers",
    description:
      "Engineered for the grind. Premium French terry joggers with tapered fit, side stripe detail, and reinforced cuffs. Move different.",
    price: 22000,
    categorySlug: "joggers",
    isFeatured: true,
    images: ["/products/joggers-black.png"],
    variants: [
      { color: "Black", size: "S", sku: "SRJ-BLK-S", stock: 18 },
      { color: "Black", size: "M", sku: "SRJ-BLK-M", stock: 30 },
      { color: "Black", size: "L", sku: "SRJ-BLK-L", stock: 25 },
      { color: "Black", size: "XL", sku: "SRJ-BLK-XL", stock: 12 },
      { color: "Grey", size: "S", sku: "SRJ-GRY-S", stock: 10 },
      { color: "Grey", size: "M", sku: "SRJ-GRY-M", stock: 20 },
      { color: "Grey", size: "L", sku: "SRJ-GRY-L", stock: 15 },
      { color: "Grey", size: "XL", sku: "SRJ-GRY-XL", stock: 8 },
    ],
  },
  {
    name: "Carbon Tactical Joggers",
    slug: "carbon-tactical-joggers",
    description:
      "Dark charcoal joggers with utility-inspired detailing. Zippered pockets, embroidered PMD crest at the hip. For the disciplined.",
    price: 25000,
    categorySlug: "joggers",
    isFeatured: false,
    images: ["/products/joggers-grey.png"],
    variants: [
      { color: "Charcoal", size: "S", sku: "CTJ-CHR-S", stock: 15 },
      { color: "Charcoal", size: "M", sku: "CTJ-CHR-M", stock: 25 },
      { color: "Charcoal", size: "L", sku: "CTJ-CHR-L", stock: 20 },
      { color: "Charcoal", size: "XL", sku: "CTJ-CHR-XL", stock: 10 },
      { color: "Black", size: "S", sku: "CTJ-BLK-S", stock: 12 },
      { color: "Black", size: "M", sku: "CTJ-BLK-M", stock: 22 },
      { color: "Black", size: "L", sku: "CTJ-BLK-L", stock: 18 },
      { color: "Black", size: "XL", sku: "CTJ-BLK-XL", stock: 6 },
    ],
  },
  {
    name: "Apex Heavyweight Hoodie",
    slug: "apex-heavyweight-hoodie",
    description:
      "The crown piece. 400gsm heavyweight French terry hoodie with oversized diamond emblem. Double-lined hood, kangaroo pocket. Winter armor.",
    price: 32000,
    categorySlug: "new-drops",
    isFeatured: true,
    images: ["/products/hoodie-grey.png"],
    variants: [
      { color: "Dark Grey", size: "S", sku: "AHH-DGR-S", stock: 8 },
      { color: "Dark Grey", size: "M", sku: "AHH-DGR-M", stock: 15 },
      { color: "Dark Grey", size: "L", sku: "AHH-DGR-L", stock: 12 },
      { color: "Dark Grey", size: "XL", sku: "AHH-DGR-XL", stock: 5 },
      { color: "Black", size: "M", sku: "AHH-BLK-M", stock: 18 },
      { color: "Black", size: "L", sku: "AHH-BLK-L", stock: 14 },
      { color: "Black", size: "XL", sku: "AHH-BLK-XL", stock: 7 },
    ],
  },
];

async function main() {
  console.log("🔥 PMD Seed: Starting...\n");

  // Clean existing data
  console.log("  Cleaning existing data...");
  await prisma.variantInventory.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // Create categories
  console.log("  Creating categories...");
  const categoryMap: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    const created = await prisma.category.create({ data: cat });
    categoryMap[cat.slug] = created.id;
    console.log(`    ✓ ${cat.name}`);
  }

  // Create products with variants and inventory
  console.log("  Creating products...");
  for (const prod of PRODUCTS) {
    const { variants, categorySlug, ...productData } = prod;
    const product = await prisma.product.create({
      data: {
        ...productData,
        categoryId: categoryMap[categorySlug],
        variants: {
          create: variants.map((v) => ({
            color: v.color,
            size: v.size,
            sku: v.sku,
            inventory: {
              create: {
                stock: v.stock,
              },
            },
          })),
        },
      },
      include: {
        variants: { include: { inventory: true } },
      },
    });

    const totalStock = product.variants.reduce(
      (sum, v) => sum + (v.inventory?.stock || 0),
      0
    );
    console.log(
      `    ✓ ${product.name} (${product.variants.length} variants, ${totalStock} total stock)`
    );
  }

  console.log("\n💎 PMD Seed: Complete! Pressure makes diamonds.\n");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
