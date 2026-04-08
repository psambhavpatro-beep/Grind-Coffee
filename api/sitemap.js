// Vercel Serverless Function — generates sitemap.xml dynamically
// Uses Firestore REST API (no credentials needed for public Firestore)

const SITE = "https://thatsgrind.com";
const PROJECT_ID = "blr-coffee";
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/products?pageSize=500`;

const NEIGHBORHOODS = [
  "indiranagar", "koramangala", "whitefield", "hsr-layout",
  "jayanagar", "jp-nagar", "marathahalli", "electronic-city",
  "hebbal", "malleshwaram",
];

// ── Fetch all products via REST API ────────────────────────────────
async function fetchProducts() {
  const res = await fetch(FIRESTORE_URL);
  if (!res.ok) throw new Error(`Firestore REST error: ${res.status}`);
  const data = await res.json();
  if (!data.documents) return [];

  return data.documents.map((doc) => {
    const fields = doc.fields || {};
    const p = (f) => {
      if (!f) return "";
      if (f.stringValue !== undefined) return f.stringValue;
      if (f.integerValue !== undefined) return Number(f.integerValue);
      if (f.doubleValue !== undefined) return Number(f.doubleValue);
      return "";
    };
    return { name: p(fields.name) };
  });
}

function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function handler(req, res) {
  try {
    // Fetch all products from Firestore
    const products = (await fetchProducts()).filter(p => p.name);

    const today = new Date().toISOString().split("T")[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${SITE}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Product Pages -->
${products.map(p => `  <url>
    <loc>${SITE}/product/${toSlug(p.name)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join("\n")}

  <!-- Neighborhood Landing Pages -->
${NEIGHBORHOODS.map(n => `  <url>
    <loc>${SITE}/deliver/${n}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join("\n")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=600");
    return res.status(200).send(xml);
  } catch (err) {
    console.error("Sitemap generation error:", err);
    // Return a minimal sitemap even on error
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE}/</loc><priority>1.0</priority></url>
${NEIGHBORHOODS.map(n => `  <url><loc>${SITE}/deliver/${n}</loc></url>`).join("\n")}
</urlset>`;
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    return res.status(200).send(fallback);
  }
}
