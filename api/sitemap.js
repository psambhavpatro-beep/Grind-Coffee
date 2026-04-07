// Vercel Serverless Function — generates sitemap.xml dynamically
// Reads product data from Firebase Firestore so the sitemap always stays current.

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// ── Firebase Admin init (reuse across warm invocations) ────────────
if (!getApps().length) {
  initializeApp({ projectId: "blr-coffee" });
}
const db = getFirestore();

const SITE = "https://thatsgrind.com";

const NEIGHBORHOODS = [
  "indiranagar", "koramangala", "whitefield", "hsr-layout",
  "jayanagar", "jp-nagar", "marathahalli", "electronic-city",
  "hebbal", "malleshwaram",
];

function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function handler(req, res) {
  try {
    // Fetch all products from Firestore
    const snap = await db.collection("products").get();
    const products = snap.docs
      .map(d => ({ ...d.data(), id: d.id }))
      .filter(p => p.name);

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
