/**
 * generate-merchant-feed.js
 * ───────────────────────────────────────────────────────────
 * Run with:  node scripts/generate-merchant-feed.js
 *
 * Fetches all products from Firebase via REST API and generates
 * a Google Merchant Center compatible XML product feed at:
 *   public/merchant-feed.xml
 */

import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PUBLIC = join(__dirname, "..", "public");

const SITE = "https://thatsgrind.com";
const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || "blr-coffee";

// ── Fetch products via Firestore REST API ──────────────────────────
async function fetchProducts() {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/products?pageSize=500`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Firestore REST API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  if (!data.documents) return [];

  return data.documents.map((doc) => {
    const fields = doc.fields || {};
    const id = doc.name.split("/").pop();

    const parse = (f) => {
      if (!f) return "";
      if (f.stringValue !== undefined) return f.stringValue;
      if (f.integerValue !== undefined) return Number(f.integerValue);
      if (f.doubleValue !== undefined) return Number(f.doubleValue);
      if (f.booleanValue !== undefined) return f.booleanValue;
      return "";
    };

    return {
      id,
      name: parse(fields.name),
      description: parse(fields.description),
      price: parse(fields.price),
      image: parse(fields.image),
    };
  });
}

// ── Helpers ────────────────────────────────────────────────────────
function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeXml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ── Main ───────────────────────────────────────────────────────────
async function main() {
  console.log("Fetching products for merchant feed...");

  const products = await fetchProducts();

  console.log(`Found ${products.length} products.`);

  if (products.length === 0) {
    console.log("WARNING: No products found. Writing empty feed.");
  }

  const items = products
    .filter((p) => p.name)
    .map((p) => {
      const slug = toSlug(p.name);
      const link = `${SITE}/product/${slug}`;
      const image = p.image || `${SITE}/grind-logo-white.png`;
      const price = `${p.price || 0}.00 INR`;
      const desc = p.description
        ? String(p.description).slice(0, 5000)
        : p.name;

      return `    <item>
      <g:id>${escapeXml(p.id)}</g:id>
      <g:title>${escapeXml(p.name)}</g:title>
      <g:description>${escapeXml(desc)}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(image)}</g:image_link>
      <g:price>${escapeXml(price)}</g:price>
      <g:availability>in stock</g:availability>
      <g:brand>Grind</g:brand>
      <g:condition>new</g:condition>
      <g:google_product_category>Food, Beverages &amp; Tobacco &gt; Beverages &gt; Coffee</g:google_product_category>
    </item>`;
    })
    .join("\n");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Grind -- Specialty Coffee Bangalore</title>
    <link>${SITE}</link>
    <description>Premium specialty coffee delivered fast in Bangalore</description>
${items}
  </channel>
</rss>`;

  writeFileSync(join(PUBLIC, "merchant-feed.xml"), feed, "utf-8");
  console.log(`Merchant feed written to public/merchant-feed.xml`);
  console.log(`${products.filter((p) => p.name).length} products in feed.`);
}

main().catch((err) => {
  console.error("Error generating merchant feed:", err);
  process.exit(1);
});
