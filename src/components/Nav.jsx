import { useState, useRef, useEffect } from "react";
import { S } from "../styles";

export default function Nav({ user, cartCount, onShop, onRoasters, onDash, onOrders, onWishlist, onCart, onLogout, openLogin, openSignup }) {
    const [open, setOpen] = useState(false);       // sign-in dropdown (desktop)
    const [mobileOpen, setMobileOpen] = useState(false); // hamburger menu
    const ref = useRef();

    useEffect(() => {
        const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    // Close mobile menu on nav
    const go = (fn) => { setMobileOpen(false); fn(); };

    return (
        <>
            <nav style={S.nav}>
                <button style={{ ...S.logo, display: 'flex', alignItems: 'center', padding: 0 }} onClick={() => go(onShop)}>
                    <img src="/grind-logo-white.png" alt="Grind" style={{ height: 50 }} />
                </button>

                {/* Desktop links */}
                <div className="nav-links">
                    <button style={S.nb} onClick={onShop}>Shop</button>
                    <button style={S.nb} onClick={onRoasters}>Roasters</button>

                    {(user?.role === "admin" || user?.role === "vendor") && (
                        <button style={S.nb} onClick={onDash}>Dashboard</button>
                    )}
                    {user?.role === "customer" && (
                        <>
                            <button style={S.nb} onClick={onOrders}>My Orders</button>
                            <button style={S.nb} onClick={onWishlist}>♡ Saved</button>
                        </>
                    )}

                    {user ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={S.chip}>{user.name}</span>
                            <button style={{ ...S.nb, color: "rgba(255,255,255,.6)" }} onClick={onLogout}>Logout</button>
                        </div>
                    ) : (
                        <div ref={ref} style={{ position: "relative" }}>
                            <button style={S.signInBtn} onClick={() => setOpen(o => !o)}>Sign In ▾</button>
                            {open && (
                                <div style={S.drop}>
                                    <p style={S.dropSection}>SIGN IN AS</p>
                                    {[["customer", "Customer"], ["vendor", "Vendor / Roaster"], ["admin", "Owner (Admin)"]].map(([t, l]) => (
                                        <button key={t} style={S.dropItem} onClick={() => { setOpen(false); openLogin(t); }}>{l}</button>
                                    ))}
                                    <div style={S.dropDiv} />
                                    <p style={S.dropSection}>CREATE ACCOUNT</p>
                                    {[["customer", "Customer Sign Up"], ["vendor", "Apply as Vendor"]].map(([t, l]) => (
                                        <button key={t} style={S.dropItem} onClick={() => { setOpen(false); openSignup(t); }}>{l}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <button style={S.cartBtn} onClick={onCart}>
                        🛒 {cartCount > 0 && <span style={S.cartBadge}>{cartCount}</span>}
                    </button>
                </div>

                {/* Mobile right side: cart + hamburger */}
                <div className="mobile-only-nav">
                    <button className="nav-hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Menu" style={{ color: '#fff' }}>
                        {mobileOpen ? "✕" : "☰"}
                    </button>
                    <button style={{ ...S.cartBtn, position: "relative" }} onClick={onCart}>
                        🛒 {cartCount > 0 && <span style={S.cartBadge}>{cartCount}</span>}
                    </button>
                </div>
            </nav>

            {/* Mobile slide-down menu */}
            {mobileOpen && (
                <div className="mobile-menu">
                    <button onClick={() => go(onShop)}>🛍 Shop</button>
                    <button onClick={() => go(onRoasters)}>☕ Roasters</button>

                    {(user?.role === "admin" || user?.role === "vendor") && (
                        <button onClick={() => go(onDash)}>📊 Dashboard</button>
                    )}
                    {user?.role === "customer" && (
                        <>
                            <button onClick={() => go(onOrders)}>📦 My Orders</button>
                            <button onClick={() => go(onWishlist)}>♡ Saved</button>
                        </>
                    )}

                    {user ? (
                        <button onClick={() => { setMobileOpen(false); onLogout(); }} style={{ color: "#555" }}>
                            👋 Logout ({user.name})
                        </button>
                    ) : (
                        <>
                            <button onClick={() => { setMobileOpen(false); openLogin("customer"); }}>Sign In as Customer</button>
                            <button onClick={() => { setMobileOpen(false); openLogin("vendor"); }}>Sign In as Vendor</button>
                            <button onClick={() => { setMobileOpen(false); openSignup("customer"); }}>Create Account</button>
                        </>
                    )}

                    <div style={{ height: 1, background: "#f0f0f0", margin: "8px 0" }} />
                    <div style={{ padding: "12px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
                        <span style={{ fontSize: 11, fontFamily: "sans-serif", color: "#888", fontWeight: 700, letterSpacing: 1 }}>CONTACT US</span>
                        <a href="tel:+918114990288" style={{ fontSize: 14, color: "#111", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>📞 +91 8114990288</a>
                        <a href="mailto:support@thatsgrind.com" style={{ fontSize: 14, color: "#111", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>✉️ support@thatsgrind.com</a>
                    </div>
                </div>
            )}
        </>
    );
}
