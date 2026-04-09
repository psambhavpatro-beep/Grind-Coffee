// Vercel Serverless Function — dynamic Google Merchant Center XML feed
// Uses Firestore REST API (no credentials needed)
// Route: /merchant-feed.xml → /api/merchant-feed

const SITE = "https://thatsgrind.com";
const PROJECT_ID = "blr-coffee";
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/products?pageSize=500`;

async function fetchProducts() {
  const res = await fetch(FIRESTORE_URL);
  if (!res.ok) throw new Error(`Firestore REST error: ${res.status}`);
  const data = await res.json();
  if (!data.documents) return [];

  return data.documents.map((doc) => {
    const fields = doc.fields || {};
    const id = doc.name.split("/").pop();
    const p = (f) => {
      if (!f) return "";
      if (f.stringValue !== undefined) return f.stringValue;
      if (f.integerValue !== undefined) return Number(f.integerValue);
      if (f.doubleValue !== undefined) return Number(f.doubleValue);
      return "";
    };
    return { id, name: p(fields.name), description: p(fields.description), price: p(fields.price), image: p(fields.image) };
  });
}

function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function escXml(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export default async function handler(req, res) {
  try {
    const products = await fetchProducts();
    const items = products
      .filter((p) => p.name)
      .map((p) => {
        const slug = toSlug(p.name);
        const link = `${SITE}/product/${slug}`;
        const image = p.image || `${SITE}/grind-logo-white.png`;
        const price = `${p.price || 0}.00 INR`;
        const desc = p.description ? String(p.description).slice(0, 5000) : p.name;
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
    <description>Premium specialty coffee delivered in 45 minutes in Bangalore</description>
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
    <description>Premium specialty coffee delivered in 45 minutes in Bangalore</description>
  </channel>
</rss>`;
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    return res.status(200).send(empty);
  }
}
