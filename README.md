# ☕ Roast & Origin

> Specialty coffee delivered in under 90 minutes across Bengaluru.

A quick-commerce React + Firebase app connecting specialty coffee roasters with coffee lovers in Bangalore.

---

## Features

- **Shop** — Browse single-origin coffees with roast type, process, and tasting note filters
- **Quick delivery** — Delivery zone selection with live ETA for all major Bengaluru areas
- **Roasters** — Explore roaster profiles, their story, and their full range
- **Cart & Checkout** — Grind size selection, free-delivery progress bar, 2-step checkout
- **Wishlists & Reviews** — Save coffees, write star-rated reviews
- **Order Tracking** — Visual status stepper (Confirmed → Preparing → Out for Delivery → Delivered)
- **Vendor Dashboard** — Vendors manage their products, orders, and public profile
- **Admin Dashboard** — Approve vendors, manage all products and orders

---

## Tech Stack

| Layer    | Tool |
|----------|------|
| Frontend | React 19 + Vite 7 |
| Styling  | Inline JS styles + injected CSS (no CSS framework) |
| Backend  | Firebase Firestore (NoSQL) |
| Auth     | Firebase Authentication |
| Deploy   | Netlify / Render (static SPA) |

---

## Local Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd roast-and-origin

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.example .env
# Fill in your Firebase project values inside .env

# 4. Start the dev server
npm run dev
# → http://localhost:5173
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your Firebase config values:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## Seeding Firebase (First Run)

When you open the app for the first time and no products exist, a green **🌱 Seed Firebase** button will appear at the bottom-right corner of the page (**dev mode only**). Click it to populate Firestore with 2 demo vendors and 5 demo products.

> The seed button is removed from production builds automatically.

---

## Demo Accounts

| Role     | Email                   | Password   |
|----------|-------------------------|------------|
| Customer | _(sign up with any email)_ | —       |
| Vendor   | hello@bluekettle.com    | vendor123  |
| Vendor   | roast@darkmatter.in     | dark123    |
| Admin    | admin _(username)_      | admin123   |

> **⚠️ Change the admin password before a public launch.**

---

## Deployment (Netlify)

```bash
npm run build
```

1. Push to GitHub
2. Connect repo in Netlify → **Build command:** `npm run build` · **Publish directory:** `dist`
3. Add your `VITE_FIREBASE_*` environment variables in Netlify's site settings
4. The `public/_redirects` file handles SPA routing — no 404 on page refresh

---

## Project Structure

```
src/
├── App.jsx               ← Root orchestrator (state, routing, handlers)
├── api.js                ← All Firebase operations (single source of truth)
├── firebase.js           ← Firebase app init (reads from env vars)
├── constants.js          ← Shared constants (zones, grind types, colours)
├── utils.js              ← Pure helpers (fmt, uid, today, stars)
├── styles.js             ← All inline styles + injected CSS string
├── components/
│   ├── Nav.jsx
│   ├── DeliveryBanner.jsx
│   ├── CartDrawer.jsx
│   ├── ui.jsx            ← Toast, Inp, StatCard
│   └── modals/
│       ├── AuthModal.jsx
│       ├── CheckoutModal.jsx
│       └── ReviewModal.jsx
└── pages/
    ├── ShopView.jsx      ← Product grid + PCard component
    ├── ProductView.jsx
    ├── RoasterPage.jsx
    ├── ExploreRoasters.jsx
    ├── WishlistView.jsx
    ├── OrdersView.jsx
    ├── Dashboard.jsx     ← Vendor + Admin dashboard
    └── ProdForm.jsx
```

---

## Firebase Security

The current Firestore security rules should restrict:
- Customers can only read/write their own orders and wishlist
- Only approved vendors can write products
- Only admins can approve/reject vendors

Set these rules in the [Firebase Console → Firestore → Rules](https://console.firebase.google.com).
