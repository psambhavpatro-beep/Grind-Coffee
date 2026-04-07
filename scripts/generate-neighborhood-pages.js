/**
 * generate-neighborhood-pages.js
 * ───────────────────────────────────────────────────────────
 * Run with:  node scripts/generate-neighborhood-pages.js
 * 
 * Generates static HTML landing pages for each Bangalore
 * neighborhood at  public/deliver/<neighborhood>/index.html
 * 
 * These are fully self-contained HTML pages (no JS required)
 * so Googlebot can index them immediately.
 */

import { mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PUBLIC = join(__dirname, "..", "public");

const SITE = "https://thatsgrind.com";

const NEIGHBORHOODS = [
  {
    slug: "indiranagar",
    name: "Indiranagar",
    content: `Craving specialty coffee in Indiranagar? Grind delivers freshly roasted, single-origin coffee beans straight to your doorstep in one of Bangalore's most vibrant neighborhoods. Whether you're working from home near 12th Main or relaxing in one of Indiranagar's famous cafés, we bring you beans that are roasted within days — not weeks. From Ethiopian Yirgacheffe to Colombian Huila, our curated selection covers light, medium, and dark roasts to suit every brewing method. Indiranagar residents love our express delivery — your order arrives in as little as 45 minutes. No subscriptions, no commitments. Just world-class coffee, whenever you want it. With Grind, specialty coffee in Indiranagar has never been this easy. Order now and taste the difference that freshness makes.`,
  },
  {
    slug: "koramangala",
    name: "Koramangala",
    content: `Koramangala, the startup capital of Bangalore, deserves startup-speed coffee delivery. Grind brings you the finest specialty coffee beans from India and around the world — roasted fresh and delivered to your Koramangala address in under 90 minutes. Whether you're in 1st Block or 8th Block, our riders know every lane. Choose from single-origin pour-overs, espresso-ready blends, and rare micro-lot coffees sourced from farms in Ethiopia, Kenya, Colombia, and India's own Chikmagalur. Every bag comes with detailed tasting notes, origin stories, and brewing recommendations. Don't settle for stale supermarket coffee — Koramangala's coffee culture deserves better. Grind is building Bangalore's fastest specialty coffee delivery so you can focus on building everything else. Order your first bag today.`,
  },
  {
    slug: "whitefield",
    name: "Whitefield",
    content: `Great coffee shouldn't require a long commute — especially in Whitefield. Grind delivers premium, freshly roasted specialty coffee directly to homes and offices across Whitefield, from ITPL to Varthur and everywhere in between. Our coffees are sourced from award-winning farms and roasted in small batches by Bangalore's best independent roasters. Whether you prefer a bright, fruity light roast for your morning pour-over or a bold, chocolatey dark roast for your espresso machine, Grind has you covered. Whitefield's tech community has already discovered what makes Grind different: traceability, freshness, and speed. Every bag lists the farm, altitude, process, and roast date. No middlemen, no old stock. Just exceptional coffee delivered fast. Welcome to the future of coffee in Whitefield.`,
  },
  {
    slug: "hsr-layout",
    name: "HSR Layout",
    content: `HSR Layout residents already know good food — now discover great coffee with Grind. We deliver specialty-grade, freshly roasted coffee beans across all sectors of HSR Layout in under 90 minutes. Our catalog features single-origin coffees from the world's most celebrated growing regions: Ethiopian naturals bursting with blueberry and chocolate, washed Kenyan AA with blackcurrant intensity, and smooth Brazilian nuts-and-caramel profiles. Every order is packed with care and includes the roast date so you know exactly how fresh your coffee is. Whether you brew with an AeroPress, a V60, or a South Indian filter, we grind to your preferred size — or ship whole bean. HSR Layout, your specialty coffee upgrade is one tap away. Fast delivery, no minimum order. Try Grind today.`,
  },
  {
    slug: "jayanagar",
    name: "Jayanagar",
    content: `Jayanagar has a rich history of appreciating the finer things — and specialty coffee is no exception. Grind brings Bangalore's best micro-roasted coffees to every block in Jayanagar with express delivery in 45 to 90 minutes. From the tree-lined avenues of 4th Block to the bustling markets near 9th Block, our delivery network covers it all. We partner with passionate, independent roasters who source directly from farms in Chikmagalur, Coorg, Ethiopia, and Colombia. Each coffee is roasted to order in small batches, ensuring peak freshness and flavor. Our South Indian filter grind is a local favorite — perfect for that morning tumbler of decoction. But we also cater to pour-over purists, espresso enthusiasts, and cold-brew converts. Jayanagar, elevate your daily cup with Grind.`,
  },
  {
    slug: "jp-nagar",
    name: "JP Nagar",
    content: `JP Nagar coffee lovers, Grind is here for you. We deliver freshly roasted specialty coffee across all phases of JP Nagar — from 1st Phase near Bannerghatta Road to 6th Phase and beyond. Why settle for mass-produced, months-old coffee when you can have single-origin beans roasted within the last week? Grind connects you directly with Bangalore's finest independent roasters, cutting out middlemen and delivering unmatched freshness. Our express delivery gets your coffee to your door in under 90 minutes. Browse our menu of Ethiopian, Colombian, Kenyan, Brazilian, and Indian-origin coffees, each with detailed tasting notes and farm information. We offer whole bean, espresso, pour-over, filter, French press, and cold brew grinds. JP Nagar, your perfect cup starts with Grind.`,
  },
  {
    slug: "marathahalli",
    name: "Marathahalli",
    content: `Marathahalli, one of Bangalore's busiest IT corridors, now has access to the city's best specialty coffee through Grind. We deliver freshly roasted, single-origin coffee beans to your door in record time — perfect for that mid-morning pick-me-up or your evening brewing ritual. Our coffees are sourced from top-rated farms across the coffee belt and roasted in micro-batches by skilled artisan roasters right here in Bangalore. From light-roasted Ethiopians with floral jasmine notes to dark-roasted Sumatrans with earthy cocoa depth, there's a coffee for every mood and method. Marathahalli residents love our variety: whole bean, multiple grind sizes, and a rotating selection of limited-edition lots. Skip the instant coffee. Skip the traffic to the café. Grind brings the café to you.`,
  },
  {
    slug: "electronic-city",
    name: "Electronic City",
    content: `Working in Electronic City? Fuel your focus with specialty coffee from Grind. We deliver freshly roasted, premium coffee beans throughout Electronic City — Phase 1, Phase 2, and surrounding areas. Our express delivery service means you don't have to leave campus to get exceptional coffee. We source from farms in Ethiopia, Colombia, Kenya, Brazil, Indonesia, and India's Western Ghats, working only with roasters who obsess over quality. Every bag comes with full traceability: farm name, altitude, processing method, roast date, and tasting notes. Whether your team prefers a smooth medium roast for drip brewing or a punchy light roast for V60, Grind has the perfect match. We also offer bulk ordering for offices. Electronic City, upgrade from vending machine coffee — order Grind today.`,
  },
  {
    slug: "hebbal",
    name: "Hebbal",
    content: `Hebbal residents, discover the joy of truly fresh coffee. Grind delivers specialty-grade, artisan-roasted coffee beans across Hebbal and North Bangalore in under 90 minutes. Located near Hebbal Lake, Manyata Tech Park, or Bellary Road? We've got you covered. Our selection features single-origin coffees from the world's premier growing regions — each roasted to perfection by Bangalore's independent micro-roasters. You'll find bright and fruity Kenyan AAs, rich and nutty Brazilians, bold Sumatrans, and delicate washed Ethiopians. Every coffee comes with detailed tasting notes so you can explore flavors like a pro. We grind to order for any brewing method: espresso, pour-over, AeroPress, Moka pot, French press, or cold brew. Hebbal, your morning ritual deserves better. It deserves Grind.`,
  },
  {
    slug: "malleshwaram",
    name: "Malleshwaram",
    content: `Malleshwaram, one of Bangalore's oldest and most charming neighborhoods, meets its newest coffee experience: Grind. We deliver freshly roasted specialty coffee — single-origin beans from across the globe — right to your door in Malleshwaram. From the heritage homes near 8th Cross to the vibrant streets near Mantri Mall, our riders ensure fast delivery in 45 to 90 minutes. Malleshwaram has always been a neighborhood of taste and tradition. Grind honors that by partnering with roasters who use traditional drum-roasting techniques on beans sourced from farms in Coorg, Chikmagalur, Ethiopia, and Latin America. Whether you're a filter coffee loyalist or an espresso explorer, we've got whole bean and custom grind options for every palate. Malleshwaram, welcome to Grind.`,
  },
];

function generatePage({ slug, name, content }) {
  const title = `Specialty Coffee Delivery in ${name}, Bangalore | Grind`;
  const description = `Order specialty coffee online in ${name}, Bangalore. Grind delivers freshly roasted single-origin coffee to your door in ${name}. Fast delivery, premium quality.`;
  const url = `${SITE}/deliver/${slug}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" href="/grind-favicon.png" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta name="theme-color" content="#1b4332" />
  <link rel="canonical" href="${url}" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Grind" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${SITE}/grind-logo-white.png" />
  <meta property="og:locale" content="en_IN" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${SITE}/grind-logo-white.png" />

  <!-- JSON-LD: LocalBusiness + Delivery -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Grind",
    "url": "${SITE}",
    "logo": "${SITE}/grind-logo-white.png",
    "description": "Specialty coffee delivery in ${name}, Bangalore",
    "areaServed": {
      "@type": "Place",
      "name": "${name}, Bangalore"
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Bangalore",
      "addressRegion": "Karnataka",
      "addressCountry": "IN"
    },
    "telephone": "+918114990288",
    "email": "support@thatsgrind.com",
    "priceRange": "₹₹"
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

    .hero { background: #111; padding: 80px 28px 64px; text-align: center; }
    .hero-eyebrow { color: #4ade80; letter-spacing: 5px; font-size: 10px; text-transform: uppercase; margin-bottom: 16px; font-family: 'Inter', sans-serif; font-weight: 600; }
    .hero h1 { font-size: clamp(28px, 5vw, 52px); font-weight: 700; line-height: 1.1; margin-bottom: 18px; color: #fff; }
    .hero h1 span { color: #4ade80; }

    .content { max-width: 760px; margin: 0 auto; padding: 48px 28px 60px; flex: 1; }
    .content p { color: #444; font-family: 'Inter', sans-serif; font-size: 15px; line-height: 1.85; margin-bottom: 24px; }
    .content .highlight { background: #eaf4e8; border-left: 4px solid #1b4332; padding: 18px 22px; border-radius: 0 10px 10px 0; margin: 32px 0; }
    .content .highlight p { color: #1b4332; font-weight: 600; margin-bottom: 0; }

    .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 18px; margin: 36px 0; }
    .feature { background: #fff; border: 2px solid #111; border-radius: 12px; padding: 20px; text-align: center; box-shadow: 3px 3px 0 #111; }
    .feature-icon { font-size: 28px; margin-bottom: 8px; }
    .feature h3 { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
    .feature p { font-size: 12px; color: #666; font-family: 'Inter', sans-serif; margin-bottom: 0; }

    .cta-section { text-align: center; padding: 48px 28px; background: #1b4332; margin-top: auto; }
    .cta-btn { display: inline-block; background: #fff; color: #1b4332; font-family: 'Inter', sans-serif; font-weight: 700; font-size: 16px; padding: 16px 36px; border-radius: 10px; border: none; cursor: pointer; transition: transform .15s, box-shadow .15s; text-decoration: none; }
    .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,.25); }
    .cta-sub { color: rgba(255,255,255,.7); font-family: 'Inter', sans-serif; font-size: 13px; margin-top: 12px; }

    .footer { background: #111; color: #ddd; padding: 36px 28px; text-align: center; }
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

  <div class="hero">
    <p class="hero-eyebrow">⚡ Fast delivery in ${name}</p>
    <h1>Specialty Coffee Delivery in <span>${name}</span>, Bangalore</h1>
  </div>

  <div class="content">
    <p>${content}</p>

    <div class="highlight">
      <p>⚡ Grind delivers to ${name} in 45–90 minutes. Freshly roasted, single-origin specialty coffee — no subscriptions required.</p>
    </div>

    <div class="features">
      <div class="feature">
        <div class="feature-icon">🌱</div>
        <h3>Single Origin</h3>
        <p>Traceable beans from top farms worldwide</p>
      </div>
      <div class="feature">
        <div class="feature-icon">⚡</div>
        <h3>Express Delivery</h3>
        <p>45–90 min delivery across ${name}</p>
      </div>
      <div class="feature">
        <div class="feature-icon">🔥</div>
        <h3>Freshly Roasted</h3>
        <p>Roasted within days, not months</p>
      </div>
      <div class="feature">
        <div class="feature-icon">☕</div>
        <h3>Custom Grind</h3>
        <p>Ground for your brewing method</p>
      </div>
    </div>

    <p>Grind works with Bangalore's most talented independent roasters to bring you coffees you won't find on any supermarket shelf. Every bag is roasted in small batches and shipped at peak freshness — because ${name} deserves world-class coffee.</p>
  </div>

  <div class="cta-section">
    <a href="/" class="cta-btn">Order Coffee Now →</a>
    <p class="cta-sub">Free delivery on your first order · Ships across ${name}</p>
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

// ── Generate all pages ───────────────────────────────────────────────
for (const n of NEIGHBORHOODS) {
  const dir = join(PUBLIC, "deliver", n.slug);
  mkdirSync(dir, { recursive: true });
  const html = generatePage(n);
  writeFileSync(join(dir, "index.html"), html, "utf-8");
  console.log(`✅ Created: public/deliver/${n.slug}/index.html`);
}

console.log(`\n🎉 Generated ${NEIGHBORHOODS.length} neighborhood landing pages.`);
