import { useState, useRef, useEffect } from "react";
import { S } from "../styles";

export default function Nav({ user, cartCount, onShop, onRoasters, onDash, onOrders, onWishlist, onCart, onLogout, openLogin, openSignup }) {
    const [open, setOpen] = useState(false);
    const ref = useRef();

    useEffect(() => {
        const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    return (
        <nav style={S.nav}>
            <button style={S.logo} onClick={onShop}>☕ ROAST &amp; ORIGIN</button>

            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
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
                        <button style={{ ...S.nb, color: "#16a34a" }} onClick={onLogout}>Logout</button>
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
        </nav>
    );
}
