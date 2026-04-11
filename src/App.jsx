import { useState, useEffect, useCallback } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

import { CSS, S } from "./styles";
import { DEMO_VENDORS, DELIVERY_FEE } from "./constants";
import { uid } from "./utils";
import * as api from "./api";

// ═══════════════════════════════════════════════════════════════════
// SEO HELPER — dynamically updates <head> meta tags per view
// ═══════════════════════════════════════════════════════════════════
const SITE = "https://thatsgrind.com";
const DEFAULT_TITLE = "Grind — Specialty Coffee Delivered in 45 Minutes in Bangalore";
const DEFAULT_DESC = "Order freshly roasted specialty coffee online in Bangalore. Delivered in 45 minutes across all neighborhoods. Filter coffee, single origins, and more.";
const OG_IMAGE = `${SITE}/grind-logo-white.png`;

function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    if (name.startsWith("og:") || name.startsWith("twitter:")) el.setAttribute("property", name);
    else el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(url) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) { el = document.createElement("link"); el.setAttribute("rel", "canonical"); document.head.appendChild(el); }
  el.setAttribute("href", url);
}

function setJsonLd(id, data) {
  let el = document.getElementById(id);
  if (!el) { el = document.createElement("script"); el.id = id; el.type = "application/ld+json"; document.head.appendChild(el); }
  el.textContent = JSON.stringify(data);
}

function removeJsonLd(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function updateSEO({ title, description, url, image, product }) {
  document.title = title || DEFAULT_TITLE;
  setMeta("description", description || DEFAULT_DESC);
  setCanonical(url || SITE + "/");
  setMeta("og:title", title || DEFAULT_TITLE);
  setMeta("og:description", description || DEFAULT_DESC);
  setMeta("og:url", url || SITE + "/");
  setMeta("og:image", image || OG_IMAGE);
  setMeta("twitter:title", title || DEFAULT_TITLE);
  setMeta("twitter:description", description || DEFAULT_DESC);
  setMeta("twitter:image", image || OG_IMAGE);

  if (product) {
    setJsonLd("seo-product-jsonld", {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description || `${product.name} — ${product.notes}`,
      image: product.image,
      brand: { "@type": "Brand", name: "Grind" },
      offers: {
        "@type": "Offer",
        url: url,
        priceCurrency: "INR",
        price: product.price,
        availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        seller: { "@type": "Organization", name: "Grind" },
      },
    });
  } else {
    removeJsonLd("seo-product-jsonld");
  }
}

// Components
import Nav from "./components/Nav";
import CartDrawer from "./components/CartDrawer";
import { Toast } from "./components/ui";
import AuthModal from "./components/modals/AuthModal";
import CheckoutModal from "./components/modals/CheckoutModal";
import ReviewModal from "./components/modals/ReviewModal";

// Pages
import ShopView from "./pages/ShopView";
import ProductView from "./pages/ProductView";
import RoasterPage from "./pages/RoasterPage";
import ExploreRoasters from "./pages/ExploreRoasters";
import WishlistView from "./pages/WishlistView";
import OrdersView from "./pages/OrdersView";
import Dashboard from "./pages/Dashboard";
import ProdForm from "./pages/ProdForm";

// ═══════════════════════════════════════════════════════════════════
// ROOT APP  — state, handlers, routing only
// ═══════════════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("shop");
  const [modal, setModal] = useState(null);   // login | signup | checkout | review
  const [loginType, setLoginType] = useState("customer");
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState({});

  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState({});
  const [selProduct, setSelProduct] = useState(null);
  const [selVendor, setSelVendor] = useState(null);
  const [editProd, setEditProd] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [grindSel, setGrindSel] = useState({});
  const [toast, setToast] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [shopFilter, setShopFilter] = useState({ search: "", roast: "all", process: "all", sort: "default" });

  const pop = useCallback((msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }, []);

  // ── AUTH PERSISTENCE ──
  // Track order listener unsub so we can cancel it on logout
  const [orderUnsub, setOrderUnsub] = useState(null);

  // Runs once on mount
  useEffect(() => {
    Promise.all([api.fetchProducts(), api.fetchVendors()])
      .then(([prods, fbVendors]) => {
        setProducts(prods);
        setVendors(fbVendors);

        // Support both /product/slug (new) and /?p=id (legacy)
        const path = window.location.pathname;
        const slugMatch = path.match(/^\/product\/(.+)/);
        const params = new URLSearchParams(window.location.search);
        const pId = params.get("p");

        if (slugMatch) {
          const slug = slugMatch[1];
          const p = prods.find(x => x.name && toSlug(x.name) === slug);
          if (p) {
            setSelProduct(p);
            setView("product");
          }
        } else if (pId) {
          const p = prods.find(x => x.id === pId);
          if (p) {
            setSelProduct(p);
            setView("product");
          }
        }
      })
      .catch(e => console.error("Catalogue load error:", e));

    const unsub = onAuthStateChanged(auth, async firebaseUser => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        if (orderUnsub) orderUnsub();
        return;
      }
      try {
        let profile = await api.getUserProfile(firebaseUser.uid, "customer");
        if (!profile) profile = await api.getUserProfile(firebaseUser.uid, "vendor");
        if (profile) {
          setUser(profile);
          if (profile.role === "customer") {
            const [ids, myOrds] = await Promise.all([
              api.fetchWishlist(profile.id),
              api.fetchMyOrders(profile.id),
            ]);
            setWishlist(prev => ({ ...prev, [profile.id]: ids }));
            setOrders(myOrds);
          } else if (profile.role === "vendor" || profile.role === "admin") {
            const unsubOrders = api.listenToAllOrders(setOrders);
            setOrderUnsub(() => unsubOrders);
          }
        }
      } catch (e) {
        console.error("Auth restore error:", e);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsub();
      if (orderUnsub) orderUnsub();
    };
  }, []);

  // ── BROWSER BACK/FORWARD SUPPORT ──
  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname;
      const slugMatch = path.match(/^\/product\/(.+)/);
      if (slugMatch) {
        const slug = slugMatch[1];
        const p = products.find(x => x.name && toSlug(x.name) === slug);
        if (p) { setSelProduct(p); setView("product"); return; }
      }
      // Default: go back to shop
      setSelProduct(null);
      setView("shop");
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [products]);

  // ── DYNAMIC SEO — update <head> whenever the view changes ──
  useEffect(() => {
    if (view === "product" && selProduct) {
      const p = selProduct;
      const slug = toSlug(p.name);
      const title = `${p.name} — ${p.origin} ${p.roastType} Roast | Grind`;
      const desc = `${p.name}: ${p.notes || ""} — ${p.roastType} roast from ${p.origin}. ${p.description || ""} Delivered in 45 minutes in Bangalore.`.slice(0, 160);
      const url = `${SITE}/product/${slug}`;
      updateSEO({ title, description: desc, url, image: p.image, product: p });
    } else if (view === "roaster" && selVendor) {
      updateSEO({
        title: `${selVendor.name} — Roaster Profile | Grind`,
        description: `${selVendor.tagline || ""} ${selVendor.story || ""}`.slice(0, 160),
        url: `${SITE}/`,
      });
    } else if (view === "roasters") {
      updateSEO({
        title: "Explore Roasters — Specialty Coffee Roasters in Bangalore | Grind",
        description: "Discover Bangalore's finest specialty coffee roasters. Small-batch, single-origin coffees delivered to your door.",
        url: `${SITE}/`,
      });
    } else if (view === "wishlist") {
      updateSEO({ title: "Your Wishlist | Grind", url: `${SITE}/` });
    } else if (view === "orders") {
      updateSEO({ title: "Your Orders | Grind", url: `${SITE}/` });
    } else if (view === "dashboard") {
      updateSEO({ title: "Dashboard | Grind", url: `${SITE}/` });
    } else {
      updateSEO({ title: DEFAULT_TITLE, description: DEFAULT_DESC, url: `${SITE}/` });
    }
  }, [view, selProduct, selVendor]);

  const isAdmin = user?.role === "admin";
  const isVendor = user?.role === "vendor";
  const isCust = user?.role === "customer";

  // ── AUTH ──
  const refreshVendors = async () => {
    const fbV = await api.fetchVendors();
    setVendors(fbV);
  };

  const afterLogin = async u => {
    setUser(u); setModal(null);
    pop(`Welcome back, ${u.name}!`);
    if (u.role !== "customer") setView("dashboard");
    if (u.role === "customer") {
      try {
        const [ids, myOrds] = await Promise.all([
          api.fetchWishlist(u.id),
          api.fetchMyOrders(u.id),
        ]);
        setWishlist(prev => ({ ...prev, [u.id]: ids }));
        setOrders(myOrds);
      } catch (e) { }
    } else {
      // Admin/vendor login triggers real-time listener
      if (orderUnsub) orderUnsub();
      const unsubOrders = api.listenToAllOrders(setOrders);
      setOrderUnsub(() => unsubOrders);
    }
  };

  const logout = async () => {
    if (orderUnsub) { orderUnsub(); setOrderUnsub(null); }
    try { await api.logout(); } catch (e) { }
    setUser(null); setView("shop"); setOrders([]); setWishlist({});
    pop("Signed out");
  };

  // ── PRODUCTS ──
  const saveProd = async prod => {
    const vId = isVendor ? user.id : prod.vendorId;
    const p = { ...prod, vendorId: vId };
    try {
      const saved = await api.saveProduct(p);
      setProducts(prev => p.id && typeof p.id === "string" && p.id.length > 5
        ? prev.map(x => x.id === p.id ? saved : x)
        : [...prev, saved]
      );
      pop("Product saved!"); setView("dashboard");
    } catch (e) { pop("Error saving product", "err"); }
  };
  const delProd = async id => {
    try { await api.deleteProduct(id); setProducts(prev => prev.filter(p => p.id !== id)); pop("Product deleted", "err"); }
    catch (e) { pop("Error deleting", "err"); }
  };
  const toggleFeatured = async id => {
    const prod = products.find(p => p.id === id);
    if (!prod) return;
    try {
      await api.toggleFeatured(id, prod.featured);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, featured: !p.featured } : p));
    } catch (e) { pop("Error updating", "err"); }
  };

  // ── VENDORS ──
  const saveProfile = async data => {
    try { await api.updateVendorProfile(user.id, data); setVendors(prev => ({ ...prev, [user.id]: { ...prev[user.id], ...data } })); pop("Profile saved!"); }
    catch (e) { pop("Error saving profile", "err"); }
  };
  const approveVendor = async id => {
    try { await api.approveVendor(id); setVendors(prev => ({ ...prev, [id]: { ...prev[id], approved: true } })); pop("Vendor approved!"); }
    catch (e) { pop("Error approving", "err"); }
  };
  const rejectVendor = async id => {
    try {
      await api.rejectVendor(id);
      await refreshVendors();
      pop("Vendor removed ✓");
    } catch (e) {
      console.error("Remove vendor error:", e);
      pop("Error removing vendor: " + e.message, "err");
    }
  };

  // ── CART ──
  const addCart = (product, grind) => {
    if (!grind) { pop("Select a grind size first", "err"); return; }
    const key = `${product.id}-${grind}`;
    setCart(prev => {
      const ex = prev.find(i => i.key === key);
      if (ex) return prev.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { key, product, grind, unitPrice: product.price, qty: 1 }];
    });
    pop("Added to cart ✓");
  };
  const updateQty = (key, delta) => setCart(c => c.map(i => i.key === key ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  const removeItem = key => setCart(c => c.filter(i => i.key !== key));
  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.unitPrice * i.qty, 0);

  const placeOrder = async (address, paymentMeta = null) => {
    if (!user) { pop("Sign in to place an order", "err"); setModal("login"); return; }
    const order = {
      id: "ORD-" + uid().toUpperCase(),
      customerId: user.id, customerName: user.name, customerEmail: user.email,
      items: cart.map(i => ({ name: i.product.name, grind: i.grind, qty: i.qty, unitPrice: i.unitPrice, vendorId: i.product.vendorId })),
      total: cartTotal + DELIVERY_FEE,
      status: "confirmed", date: new Date().toISOString(), address,
      // Payment info
      paymentStatus: paymentMeta ? "paid" : "cod",
      razorpayOrderId: paymentMeta?.razorpayOrderId || null,
      razorpayPaymentId: paymentMeta?.razorpayPaymentId || null,
      // Shiprocket tracking — populated by Cloud Function after shipment creation
      trackingId: null,
      trackingUrl: null,
    };
    try {
      await api.placeOrder(order);
      setOrders(prev => [order, ...prev]);
      clearCart(); setModal(null); setCartOpen(false);
      pop("Order placed! 🎉"); setView("orders");
      // Trigger Shiprocket shipment creation in the background (non-blocking)
      // TEMPORARILY DISABLED: User is handling shipping manually for now since Multi-Vendor locations aren't set up.
      // api.triggerShiprocket(order.id).catch(e => console.warn("Shiprocket trigger failed:", e.message));
    } catch (e) { pop("Error placing order", "err"); }
  };
  const updateOrderStatus = async (id, status) => {
    try { await api.updateOrderStatus(id, status); setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o)); pop("Status updated"); }
    catch (e) { pop("Error updating status", "err"); }
  };

  // ── REVIEWS ──
  const addReview = async (productId, rating, comment) => {
    const r = { productId, customerId: user.id, customerName: user.name, rating, comment, date: new Date().toISOString() };
    try {
      const saved = await api.addReview(r);
      setReviews(prev => [saved, ...prev]);
      setModal(null); pop("Review submitted ✓");
    } catch (e) { pop("Error submitting review", "err"); }
  };
  const loadReviews = async productId => {
    try {
      const fetched = await api.fetchReviews(productId);
      setReviews(prev => [...prev.filter(r => r.productId !== productId), ...fetched]);
    } catch (e) { }
  };
  const productReviews = id => reviews.filter(r => r.productId === id);
  const avgRating = id => {
    const rs = productReviews(id);
    if (!rs.length) return 0;
    return (rs.reduce((s, r) => s + r.rating, 0) / rs.length).toFixed(1);
  };

  // ── WISHLIST ──
  const toggleWish = async productId => {
    if (!user) { pop("Sign in to save items", "err"); return; }
    const wished = isWished(productId);
    try {
      await api.toggleWishlist(user.id, productId, wished);
      setWishlist(prev => {
        const mine = prev[user.id] || [];
        const updated = wished ? mine.filter(x => x !== productId) : [...mine, productId];
        return { ...prev, [user.id]: updated };
      });
    } catch (e) { pop("Error updating wishlist", "err"); }
  };
  const isWished = productId => !!(wishlist[user?.id] || []).includes(productId);
  const myWishlist = (wishlist[user?.id] || []).map(id => products.find(p => p.id === id)).filter(Boolean);

  // ── SHOP FILTER ──
  const filteredProducts = products.filter(p => {
    if (!vendors[p.vendorId]?.approved) return false;
    const { search, roast, process } = shopFilter;
    if (search) {
      const q = search.toLowerCase();
      const matchText = p.name.toLowerCase().includes(q) || p.origin.toLowerCase().includes(q) || (p.notes || "").toLowerCase().includes(q) || (p.farmName || "").toLowerCase().includes(q);
      const matchRoast = (p.roastType || "").toLowerCase().includes(q);
      if (!matchText && !matchRoast) return false;
    }
    if (roast !== "all" && p.roastType !== roast) return false;
    if (process !== "all" && p.process !== process) return false;
    return true;
  }).sort((a, b) => {
    if (shopFilter.sort === "price-asc") return a.price - b.price;
    if (shopFilter.sort === "price-desc") return b.price - a.price;
    if (shopFilter.sort === "newest") return b.id - a.id;
    return 0;
  });

  const myProds = isVendor ? products.filter(p => p.vendorId === user.id) : products;
  const myOrders = isCust ? orders.filter(o => o.customerId === user.id) : orders;

  const nav = (v, extra = {}) => {
    if (extra.vendor !== undefined) setSelVendor(extra.vendor);
    if (extra.product !== undefined) setSelProduct(extra.product);
    if (extra.editProd !== undefined) setEditProd(extra.editProd);
    setView(v);

    // Update browser URL for product pages
    if (v === "product" && extra.product) {
      const slug = toSlug(extra.product.name);
      window.history.pushState({ view: v, slug }, "", `/product/${slug}`);
    } else if (v === "shop") {
      window.history.pushState({ view: v }, "", `/`);
    }

    window.scrollTo(0, 0);
  };

  // ── DEV-ONLY: SEED FIREBASE ──
  const seedFirebase = async () => {
    if (!import.meta.env.DEV) return;
    await api.seedVendor("demo_vendor", { ...DEMO_VENDORS.demo_vendor });
    await api.seedVendor("dark_vendor", { ...DEMO_VENDORS.dark_vendor });
    await api.seedProduct("prod_1", { vendorId: "demo_vendor", name: "Yirgacheffe Natural", origin: "Ethiopia", farmName: "Konga Co-op", altitude: "1,900–2,200 m", process: "Natural", roastDate: "2025-02-10", roastType: "Light", notes: "Blueberry jam, dark chocolate, jasmine", description: "A stunning natural-process coffee from the birthplace of Arabica.", price: 850, stock: 40, image: "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=600&q=80", featured: true });
    await api.seedProduct("prod_2", { vendorId: "demo_vendor", name: "Colombia Huila Washed", origin: "Colombia", farmName: "Finca El Paraíso", altitude: "1,700–1,950 m", process: "Washed", roastDate: "2025-02-14", roastType: "Medium", notes: "Brown sugar, red apple, caramel", description: "A classic Colombian Huila showcasing the region's trademark balance.", price: 720, stock: 60, image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80", featured: false });
    await api.seedProduct("prod_3", { vendorId: "dark_vendor", name: "Sumatra Mandheling", origin: "Indonesia", farmName: "Dolok Sanggul Estate", altitude: "1,200–1,500 m", process: "Wet-Hulled", roastDate: "2025-02-08", roastType: "Dark", notes: "Dark cocoa, cedar, earthy, molasses", description: "Bold and brooding — a wet-hulled Sumatran.", price: 680, stock: 25, image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&q=80", featured: false });
    await api.seedProduct("prod_4", { vendorId: "demo_vendor", name: "Kenya AA Kirinyaga", origin: "Kenya", farmName: "Kirinyaga Estate", altitude: "1,600–1,800 m", process: "Washed", roastDate: "2025-02-18", roastType: "Medium-Light", notes: "Blackcurrant, tomato, citrus zest", description: "A vibrant Kenyan AA with dramatic fruit complexity.", price: 920, stock: 30, image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80", featured: true });
    await api.seedProduct("prod_5", { vendorId: "dark_vendor", name: "Brazil Cerrado Natural", origin: "Brazil", farmName: "Fazenda Ambiental", altitude: "900–1,100 m", process: "Natural", roastDate: "2025-02-20", roastType: "Medium-Dark", notes: "Milk chocolate, hazelnuts, dried fruit", description: "A classic Brazilian natural from the Cerrado highlands.", price: 580, stock: 80, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80", featured: false });
    await refreshVendors();
    setProducts(await api.fetchProducts());
    pop("✅ Firebase seeded!");
  };

  // ── LOADING STATE ──
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f8f9f5", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 40 }}>☕</div>
      <p style={{ fontFamily: "sans-serif", color: "#888", fontSize: 15 }}>Loading Grind…</p>
    </div>
  );

  return (
    <div style={S.root}>
      <style>{CSS}</style>

      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Seed button — dev only, hidden in production builds */}
      {import.meta.env.DEV && products.length === 0 && (
        <button onClick={seedFirebase} style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999, background: "#1b4332", color: "#fff", border: "none", padding: "12px 20px", borderRadius: 8, cursor: "pointer", fontFamily: "sans-serif", fontWeight: 700, fontSize: 13, boxShadow: "0 4px 12px rgba(0,0,0,.2)" }}>
          🌱 Seed Firebase
        </button>
      )}

      <Nav
        user={user} cartCount={cartCount}
        onShop={() => nav("shop")} onRoasters={() => nav("roasters")}
        onDash={() => nav("dashboard")} onOrders={() => nav("orders")}
        onWishlist={() => nav("wishlist")}
        onCart={() => setCartOpen(true)} onLogout={logout}
        openLogin={t => { setLoginType(t); setModal("login"); }}
        openSignup={t => { setLoginType(t); setModal("signup"); }}
      />

      <main>
        {view === "shop" && <ShopView products={filteredProducts} allProducts={products} vendors={vendors} filter={shopFilter} setFilter={setShopFilter} onProd={p => nav("product", { product: p })} onVendor={v => nav("roaster", { vendor: v })} isWished={isWished} onWish={toggleWish} avgRating={avgRating} />}
        {view === "product" && selProduct && <ProductView onLoad={() => loadReviews(selProduct.id)} product={selProduct} vendor={vendors[selProduct.vendorId]} grind={grindSel[selProduct.id] || ""} setGrind={g => setGrindSel(s => ({ ...s, [selProduct.id]: g }))} onAdd={addCart} onBack={() => nav("shop")} onVendor={v => nav("roaster", { vendor: v })} isWished={isWished(selProduct.id)} onWish={() => toggleWish(selProduct.id)} reviews={productReviews(selProduct.id)} avgRating={avgRating(selProduct.id)} onReview={user && isCust ? () => { setModalData({ productId: selProduct.id }); setModal("review"); } : null} user={user} onOpenCart={() => setCartOpen(true)} />}
        {view === "roaster" && selVendor && <RoasterPage vendor={selVendor} products={products.filter(p => p.vendorId === selVendor.id)} onProd={p => nav("product", { product: p })} onBack={() => nav("shop")} isWished={isWished} onWish={toggleWish} avgRating={avgRating} />}
        {view === "roasters" && <ExploreRoasters vendors={vendors} products={products} onVendor={v => nav("roaster", { vendor: v })} />}
        {view === "wishlist" && <WishlistView items={myWishlist} onProd={p => nav("product", { product: p })} onWish={toggleWish} onBack={() => nav("shop")} />}
        {view === "orders" && <OrdersView orders={myOrders} user={user} isAdmin={isAdmin} isVendor={isVendor} vendors={vendors} products={products} onStatus={updateOrderStatus} onBack={() => nav(isCust ? "shop" : "dashboard")} />}
        {view === "dashboard" && (isAdmin || isVendor) && <Dashboard user={user} products={myProds} vendors={vendors} orders={orders} reviews={reviews} isAdmin={isAdmin} onAdd={() => nav("editprod", { editProd: null })} onEdit={p => nav("editprod", { editProd: p })} onDel={delProd} onToggleFeat={toggleFeatured} onApprove={approveVendor} onReject={rejectVendor} onVendor={v => nav("roaster", { vendor: v })} onSaveProfile={saveProfile} onOrders={() => nav("orders")} />}
        {view === "editprod" && (isAdmin || isVendor) && <ProdForm product={editProd} vendors={vendors} isAdmin={isAdmin} user={user} onSave={saveProd} onCancel={() => nav("dashboard")} />}
      </main>

      <footer style={{ background: "#111", color: "#ddd", padding: "48px 28px", textAlign: "center", marginTop: "auto" }}>
        <h3 style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2.5, marginBottom: 20, color: "#888", fontFamily: "sans-serif" }}>Contact Us</h3>
        <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap", fontSize: 13, fontFamily: "sans-serif", fontWeight: 600 }}>
          <a href="tel:+918114990288" style={{ color: "#ddd", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>📞 +91 8114990288</a>
          <a href="mailto:support@thatsgrind.com" style={{ color: "#ddd", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>✉️ support@thatsgrind.com</a>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 40, fontSize: 12, fontFamily: "sans-serif", color: "#888", flexWrap: "wrap" }}>
          <a href="/policies/terms" style={{ color: "#888", textDecoration: "none" }}>Terms</a>
          <span>|</span>
          <a href="/policies/privacy" style={{ color: "#888", textDecoration: "none" }}>Privacy</a>
          <span>|</span>
          <a href="/policies/refunds" style={{ color: "#888", textDecoration: "none" }}>Refunds</a>
          <span>|</span>
          <a href="/policies/shipping" style={{ color: "#888", textDecoration: "none" }}>Shipping</a>
        </div>
      </footer>

      {/* Modals */}
      {(modal === "login" || modal === "signup") && <AuthModal mode={modal} loginType={loginType} setLoginType={setLoginType} onClose={() => setModal(null)} onSuccess={u => { refreshVendors(); afterLogin(u); }} onSwitch={() => setModal(modal === "login" ? "signup" : "login")} pop={pop} />}
      {modal === "checkout" && <CheckoutModal cart={cart} total={cartTotal} user={user} onPlace={placeOrder} onClose={() => setModal(null)} />}
      {modal === "review" && modalData && <ReviewModal productId={modalData.productId} user={user} onSubmit={addReview} onClose={() => setModal(null)} />}

      {cartOpen && <CartDrawer cart={cart} total={cartTotal} onQty={updateQty} onRemove={removeItem} onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); if (!user) { pop("Sign in to checkout", "err"); setModal("login"); } else setModal("checkout"); }} />}
    </div>
  );
}