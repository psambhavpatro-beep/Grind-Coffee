/**
 * generate-product-pages.js
 * ───────────────────────────────────────────────────────────
 * Run with:  node scripts/generate-product-pages.js
 *
 * Fetches all products from the Firebase "products" collection
 * using the REST API (no credentials needed for public Firestore)
 * and generates a static HTML page for each at:
 *   public/product/<slug>/index.html
 *
 * These are fully self-contained HTML pages (no JS required)
 * so Googlebot and Google Shopping can index them immediately.
 */

import { mkdirSync, writeFileSync } from "fs";
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

    // Parse Firestore REST field values
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
      origin: parse(fields.origin),
      roastType: parse(fields.roastType),
      process: parse(fields.process),
      notes: parse(fields.notes),
      weight: parse(fields.weight) || "250g",
      altitude: parse(fields.altitude),
      farmName: parse(fields.farmName),
      featured: parse(fields.featured),
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

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeJsonLd(str) {
  if (!str) return "";
  return String(str).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

// ── Page Template ──────────────────────────────────────────────────
function generatePage(product) {
  const slug = toSlug(product.name);
  const url = `${SITE}/product/${slug}`;
  const title = `${product.name} | Grind — Specialty Coffee Bangalore`;
  const desc = product.description
    ? `${String(product.description).slice(0, 140)} — delivered fast in Bangalore by Grind`
    : `${product.name} — premium specialty coffee delivered fast in Bangalore by Grind`;
  const image = product.image || `${SITE}/grind-logo-white.png`;
  const price = product.price || 0;
  const weight = product.weight || "250g";
  const origin = product.origin || "";
  const roastType = product.roastType || "";
  const notes = product.notes || "";
  const process = product.process || "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" href="/grind-favicon.png" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(desc)}" />
  <meta name="theme-color" content="#1b4332" />
  <link rel="canonical" href="${url}" />

  <!-- Open Graph -->
  <meta property="og:type" content="product" />
  <meta property="og:site_name" content="Grind" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(desc)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta property="og:locale" content="en_IN" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(desc)}" />
  <meta name="twitter:image" content="${escapeHtml(image)}" />

  <!-- JSON-LD: Product -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "${escapeJsonLd(product.name)}",
    "description": "${escapeJsonLd(product.description || product.name)}",
    "image": "${escapeJsonLd(image)}",
    "brand": {
      "@type": "Brand",
      "name": "Grind"
    },
    "offers": {
      "@type": "Offer",
      "price": "${price}",
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "url": "${url}",
      "seller": {
        "@type": "Organization",
        "name": "Grind"
      }
    }
  }
  </script>

  <style>
    @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Inter:wght@400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #f8f9f5; color: #111; font-family: 'Libre Baskerville', Georgia, serif; min-height: 100vh; display: flex; flex-direction: column; }
    a { color: inherit; text-decoration: none; }

    .nav { position: sticky; top: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 12px 28px; background: #1b4332; }
    .nav-logo { color: #fff; font-size: 22px; font-weight: 700; letter-spacing: 1.5px; }
    .nav-logo img { height: 40px; vertical-align: middle; }
    .nav-link { color: rgba(255,255,255,.85); font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; padding: 6px 14px; border-radius: 6px; transition: background .15s; }
    .nav-link:hover { background: rgba(255,255,255,.12); }

    .product-hero { background: linear-gradient(135deg, #1b4332 0%, #2d6a4f 50%, #1b4332 100%); padding: 48px 28px 40px; text-align: center; }
    .breadcrumb { color: rgba(255,255,255,.6); font-family: 'Inter', sans-serif; font-size: 12px; margin-bottom: 12px; }
    .breadcrumb a { color: rgba(255,255,255,.7); text-decoration: underline; }
    .product-hero h1 { font-size: clamp(24px, 4vw, 42px); font-weight: 700; line-height: 1.2; color: #fff; }

    .product-main { max-width: 960px; margin: 0 auto; padding: 40px 28px 60px; flex: 1; }
    .product-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
    @media (max-width: 700px) { .product-grid { grid-template-columns: 1fr; gap: 28px; } }

    .product-image { width: 100%; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,.12); object-fit: cover; aspect-ratio: 1; background: #eee; }

    .product-info { font-family: 'Inter', sans-serif; }
    .product-price { font-size: 32px; font-weight: 700; color: #1b4332; margin-bottom: 8px; }
    .product-weight { font-size: 14px; color: #888; margin-bottom: 20px; }

    .product-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
    .meta-item { background: #fff; border: 1px solid #e8e4de; border-radius: 10px; padding: 12px 16px; }
    .meta-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #999; font-weight: 600; margin-bottom: 4px; }
    .meta-value { font-size: 14px; font-weight: 600; color: #333; }

    .product-desc { color: #555; font-size: 15px; line-height: 1.8; margin-bottom: 28px; }

    .cta-btn { display: inline-block; background: #1b4332; color: #fff; font-family: 'Inter', sans-serif; font-weight: 700; font-size: 16px; padding: 16px 40px; border-radius: 10px; border: none; cursor: pointer; transition: transform .15s, box-shadow .15s; text-decoration: none; letter-spacing: 0.5px; }
    .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(27,67,50,.35); background: #2d6a4f; }

    .tasting-notes { margin-top: 24px; padding: 18px 22px; background: #eaf4e8; border-left: 4px solid #1b4332; border-radius: 0 10px 10px 0; }
    .tasting-notes p { color: #1b4332; font-weight: 600; font-size: 14px; margin: 0; }

    .footer { background: #111; color: #ddd; padding: 36px 28px; text-align: center; margin-top: auto; }
    .footer a { color: #ddd; }
    .footer-links { display: flex; justify-content: center; gap: 28px; flex-wrap: wrap; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; }
  </style>
</head>
<body>
  <nav class="nav">
    <a href="/" class="nav-logo">
      <img src="/grind-logo-white.png" alt="Grind — Specialty Coffee" />
    </a>
    <div>
      <a href="/" class="nav-link">☕ Shop Coffee</a>
    </div>
  </nav>

  <div class="product-hero">
    <p class="breadcrumb"><a href="/">Home</a> → ${escapeHtml(product.name)}</p>
    <h1>${escapeHtml(product.name)}</h1>
  </div>

  <div class="product-main">
    <div class="product-grid">
      <img
        class="product-image"
        src="${escapeHtml(image)}"
        alt="${escapeHtml(product.name)}"
        loading="lazy"
      />

      <div class="product-info">
        <div class="product-price">₹${price}</div>
        <div class="product-weight">${escapeHtml(weight)}</div>

        <div class="product-meta">
          ${origin ? `<div class="meta-item"><div class="meta-label">Origin</div><div class="meta-value">${escapeHtml(origin)}</div></div>` : ""}
          ${roastType ? `<div class="meta-item"><div class="meta-label">Roast</div><div class="meta-value">${escapeHtml(roastType)}</div></div>` : ""}
          ${process ? `<div class="meta-item"><div class="meta-label">Process</div><div class="meta-value">${escapeHtml(process)}</div></div>` : ""}
          ${product.altitude ? `<div class="meta-item"><div class="meta-label">Altitude</div><div class="meta-value">${escapeHtml(product.altitude)}</div></div>` : ""}
        </div>

        ${product.description ? `<p class="product-desc">${escapeHtml(product.description)}</p>` : ""}

        <a href="${SITE}" class="cta-btn">Order Now →</a>

        ${notes ? `
        <div class="tasting-notes">
          <p>☕ Tasting Notes: ${escapeHtml(notes)}</p>
        </div>` : ""}
      </div>
    </div>
  </div>

  <footer class="footer">
    <div class="footer-links">
      <a href="tel:+918114990288">📞 +91 8114990288</a>
      <a href="mailto:support@thatsgrind.com">✉️ support@thatsgrind.com</a>
    </div>
  </footer>
</body>
</html>`;
}

// ── Main ───────────────────────────────────────────────────────────
async function main() {
  console.log("Fetching products from Firebase REST API...");

  const products = await fetchProducts();

  console.log(`Found ${products.length} products.`);

  if (products.length === 0) {
    console.log("WARNING: No products found in the products collection.");
    process.exit(0);
  }

  // Write a slug manifest for the sitemap and merchant feed to consume
  const slugMap = [];

  for (const product of products) {
    if (!product.name) {
      console.log(`Skipping product ${product.id} -- no name field.`);
      continue;
    }

    const slug = toSlug(product.name);
    const dir = join(PUBLIC, "product", slug);
    mkdirSync(dir, { recursive: true });
    const html = generatePage(product);
    writeFileSync(join(dir, "index.html"), html, "utf-8");
    slugMap.push({ slug, id: product.id, name: product.name });
    console.log(`Created: public/product/${slug}/index.html`);
  }

  // Write slug manifest JSON for other scripts to consume
  writeFileSync(
    join(PUBLIC, "product-slugs.json"),
    JSON.stringify(slugMap, null, 2),
    "utf-8"
  );
  console.log(`\nGenerated ${slugMap.length} product pages.`);
  console.log(`Slug manifest saved to public/product-slugs.json`);
}

main().catch((err) => {
  console.error("Error generating product pages:", err);
  process.exit(1);
});
