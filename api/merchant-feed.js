// Vercel Serverless Function — dynamic Google Merchant Center XML feed
// Fetches products live from Firebase, returns XML
// Route: /merchant-feed.xml → /api/merchant-feed

import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// ── Firebase Admin init ────────────────────────────────────────────
if (!getApps().length) {
  initializeApp({ projectId: "blr-coffee" });
}
const db = getFirestore();

const SITE = "https://thatsgrind.com";

// ── Helpers ────────────────────────────────────────────────────────
function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escXml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ── Handler ────────────────────────────────────────────────────────
export default async function handler(req, res) {
  try {
    const snap = await db.collection("products").get();
    const products = snap.docs
      .map((d) => ({ ...d.data(), id: d.id }))
      .filter((p) => p.name);

    const items = products
      .map((p) => {
        const slug = toSlug(p.name);
        const link = `${SITE}/product/${slug}`;
        const image = p.image || `${SITE}/grind-logo-white.png`;
        const price = `${p.price || 0}.00 INR`;
        const desc = p.description
          ? String(p.description).slice(0, 5000)
          : p.name;

        return `    <item>
      <g:id>${escXml(p.id)}</g:id>
      <g:title>${escXml(p.name)}</g:title>
      <g:description>${escXml(desc)}</g:description>
      <g:link>${escXml(link)}</g:link>
      <g:image_link>${escXml(image)}</g:image_link>
      <g:price>${escXml(price)}</g:price>
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
    <title>Grind - Specialty Coffee Bangalore</title>
    <link>${SITE}</link>
    <description>Premium specialty coffee delivered fast in Bangalore</description>
${items}
  </channel>
</rss>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=600");
    return res.status(200).send(feed);
  } catch (err) {
    console.error("Merchant feed error:", err);
    const empty = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Grind - Specialty Coffee Bangalore</title>
    <link>${SITE}</link>
    <description>Premium specialty coffee delivered fast in Bangalore</description>
  </channel>
</rss>`;
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    return res.status(200).send(empty);
  }
}
