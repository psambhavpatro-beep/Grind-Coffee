import { useState } from "react";
import { S } from "../styles";
import { fmt } from "../utils";
import { ROAST_C, DEF_IMG } from "../constants";
import { StatCard } from "../components/ui";
import OrdersView from "./OrdersView";

export default function Dashboard({ user, products, vendors, orders, reviews, isAdmin, onAdd, onEdit, onDel, onToggleFeat, onApprove, onReject, onVendor, onSaveProfile, onOrders }) {
    const [tab, setTab] = useState("overview");
    const [pf, setPf] = useState(!isAdmin ? { ...vendors[user.id] } : {});
    const sp = (k, v) => setPf(x => ({ ...x, [k]: v }));

    const pending = Object.values(vendors).filter(v => !v.approved);
    const approved = Object.values(vendors).filter(v => v.approved);

    const myOrders = isAdmin ? orders : orders.filter(o => o.items.some(i => i.vendorId === user.id));
    const revenue = myOrders.filter(o => o.status !== "cancelled").reduce((s, o) => {
        if (isAdmin) return s + o.total;
        return s + o.items.filter(i => i.vendorId === user.id).reduce((a, i) => a + i.unitPrice * i.qty, 0);
    }, 0);
    const myRevs = isAdmin ? reviews : reviews.filter(r => products.find(p => p.id === r.productId));

    const tabs = isAdmin
        ? [["overview", "Overview"], ["products", "Products"], ["orders", "Orders"], ["vendors", "Vendors"], ["reviews", "Reviews"]]
        : [["overview", "Overview"], ["products", "Products"], ["profile", "My Profile"], ["reviews", "My Reviews"]];

    return (
        <div style={S.dash}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <div>
                    <h2 style={S.dashH}>{isAdmin ? "Owner Dashboard" : "Vendor Dashboard"}</h2>
                    <p style={{ color: "#4a3a2a", fontSize: 12, fontFamily: "sans-serif" }}>{user.name} · {user.email}</p>
                </div>
                {(tab === "products" || tab === "overview") && (
                    <button style={S.ctaBtn} onClick={onAdd}>+ Add Product</button>
                )}
            </div>

            {/* Tabs */}
            <div style={S.tabs}>
                {tabs.map(([id, lbl]) => (
                    <button key={id} style={{ ...S.tab, ...(tab === id ? S.tabOn : {}) }} onClick={() => setTab(id)}>
                        {id === "vendors" && pending.length > 0 ? `${lbl} (${pending.length})` : lbl}
                    </button>
                ))}
            </div>

            {/* ── OVERVIEW ── */}
            {tab === "overview" && (
                <>
                    <div style={S.statsRow}>
                        <StatCard label="Products" value={products.length} />
                        <StatCard label="Total Revenue" value={fmt(revenue)} />
                        <StatCard label="Orders" value={myOrders.length} />
                        <StatCard label="Reviews" value={myRevs.length} />
                        {isAdmin && <StatCard label="Active Vendors" value={approved.length} />}
                        {isAdmin && pending.length > 0 && <StatCard label="Pending Approval" value={pending.length} alert />}
                    </div>

                    {myOrders.length > 0 && (
                        <>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                <p style={S.eyeLabel}>Recent Orders</p>
                                <button style={S.ghostBtn} onClick={onOrders}>View All →</button>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
                                {myOrders.slice(0, 5).map(o => (
                                    <div key={o.id} style={{ ...S.orderCard, cursor: "default" }}>
                                        <div>
                                            <p style={{ fontWeight: 700, fontSize: 13 }}>{o.id}</p>
                                            <p style={{ color: "#5a4a3a", fontSize: 11, fontFamily: "sans-serif" }}>{o.customerName} · {new Date(o.date).toLocaleDateString("en-IN")}</p>
                                        </div>
                                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                            <span style={{ color: "#c8864a", fontWeight: 700, fontSize: 13, fontFamily: "sans-serif" }}>{fmt(o.total)}</span>
                                            <span style={{ ...S.statusBadge, background: "#5a4a3a" }}>{o.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    <p style={{ ...S.eyeLabel, marginBottom: 12 }}>Your Products</p>
                    <div style={S.grid}>
                        {products.slice(0, 4).map(p => (
                            <div key={p.id} style={{ ...S.card, cursor: "default" }}>
                                <div style={{ ...S.cardTop, cursor: "pointer" }} onClick={() => onEdit(p)}>
                                    <img src={p.image || DEF_IMG} alt={p.name} style={S.cardImg} />
                                    <span style={{ ...S.roastPill, background: ROAST_C[p.roastType] || "#7a3f10" }}>{p.roastType}</span>
                                </div>
                                <div style={S.cardBody}>
                                    <h3 style={{ ...S.cardName, fontSize: 14 }}>{p.name}</h3>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                                        <span style={{ color: "#c8864a", fontWeight: 700 }}>{fmt(p.price)}</span>
                                        <div style={{ display: "flex", gap: 6 }}>
                                            <button style={S.actBtn} onClick={() => onEdit(p)}>Edit</button>
                                            <button style={{ ...S.actBtn, color: "#e05050" }} onClick={() => onDel(p.id)}>Del</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* ── PRODUCTS TABLE ── */}
            {tab === "products" && (
                <div style={{ overflowX: "auto" }}>
                    <table style={S.table}>
                        <thead><tr>
                            {["Product", "Origin", "Process", "Roast", isAdmin ? "Vendor" : null, "Price", "Stock", "Featured", ""].filter(Boolean).map(h => <th key={h} style={S.th}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id} style={{ borderBottom: "1px solid #160e08" }}>
                                    <td style={S.td}><strong>{p.name}</strong></td>
                                    <td style={S.td}>{p.origin}</td>
                                    <td style={S.td}>{p.process}</td>
                                    <td style={S.td}><span style={{ ...S.badgePill, background: ROAST_C[p.roastType] || "#7a3f10", fontSize: 10 }}>{p.roastType}</span></td>
                                    {isAdmin && <td style={S.td}>{vendors[p.vendorId]?.name || "—"}</td>}
                                    <td style={S.td}>{fmt(p.price)}</td>
                                    <td style={{ ...S.td, color: (p.stock || 0) < 20 ? "#e07040" : "#7fc47f" }}>{p.stock}</td>
                                    <td style={S.td}>
                                        <button style={{ ...S.actBtn, color: p.featured ? "#c8864a" : "#4a3a2a" }} onClick={() => onToggleFeat(p.id)}>
                                            {p.featured ? "★ Yes" : "☆ No"}
                                        </button>
                                    </td>
                                    <td style={S.td}>
                                        <div style={{ display: "flex", gap: 6 }}>
                                            <button style={S.actBtn} onClick={() => onEdit(p)}>Edit</button>
                                            <button style={{ ...S.actBtn, color: "#e05050" }} onClick={() => onDel(p.id)}>Del</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── ORDERS ── */}
            {tab === "orders" && (
                <OrdersView orders={myOrders} user={user} isAdmin={isAdmin} isVendor={!isAdmin} vendors={vendors} products={products} onStatus={onOrders} onBack={() => setTab("overview")} />
            )}

            {/* ── VENDOR PROFILE ── */}
            {tab === "profile" && !isAdmin && (
                <div style={{ maxWidth: 640 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        {[["Roastery Name", "name"], ["Tagline", "tagline"], ["Location", "location"], ["Phone", "phone"], ["Website", "website"], ["Roasting Since", "since"], ["Avatar / Logo URL", "avatar"]].map(([lbl, k]) => (
                            <div key={k} style={{ gridColumn: k === "avatar" || k === "tagline" ? "1/-1" : undefined }}>
                                <label style={S.fLabel}>{lbl}</label>
                                <input style={S.inp} value={pf[k] || ""} onChange={e => sp(k, e.target.value)} />
                            </div>
                        ))}
                        <div style={{ gridColumn: "1/-1" }}>
                            <label style={S.fLabel}>Your Story</label>
                            <textarea style={{ ...S.inp, minHeight: 160, resize: "vertical" }} value={pf.story || ""} onChange={e => sp("story", e.target.value)} placeholder="Tell customers who you are, your sourcing philosophy, your journey…" />
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
                        <button style={S.ctaBtn} onClick={() => onSaveProfile(pf)}>Save Profile</button>
                        <button style={S.ghostBtn} onClick={() => onVendor(vendors[user.id])}>Preview Profile</button>
                    </div>
                </div>
            )}

            {/* ── VENDORS (admin) ── */}
            {tab === "vendors" && isAdmin && (
                <div>
                    {pending.length > 0 && (
                        <>
                            <p style={{ color: "#e07040", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, fontFamily: "sans-serif" }}>Pending Approval</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                                {pending.map(v => (
                                    <div key={v.id} style={S.vCard}>
                                        <div>
                                            <strong style={{ fontSize: 15 }}>{v.name}</strong>
                                            <p style={{ color: "#4a3a2a", fontSize: 12, fontFamily: "sans-serif" }}>{v.email} · {v.location}</p>
                                            {v.tagline && <p style={{ color: "#9a8878", fontSize: 12, fontStyle: "italic" }}>{v.tagline}</p>}
                                        </div>
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <button style={S.ctaBtn} onClick={() => onApprove(v.id)}>Approve</button>
                                            <button style={{ ...S.ghostBtn, color: "#e05050", borderColor: "#e05050", fontSize: 13 }} onClick={() => onReject(v.id)}>Reject</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                    <p style={{ color: "#4a3a2a", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, fontFamily: "sans-serif" }}>Active Vendors ({approved.length})</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {approved.map(v => (
                            <div key={v.id} style={S.vCard}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    {v.avatar && <img src={v.avatar} alt={v.name} style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover" }} />}
                                    <div>
                                        <strong style={{ fontSize: 14 }}>{v.name}</strong>
                                        <p style={{ color: "#4a3a2a", fontSize: 12, fontFamily: "sans-serif" }}>{v.email} · {v.location}</p>
                                        <p style={{ color: "#5a4a3a", fontSize: 11, fontFamily: "sans-serif" }}>{products.filter(p => p.vendorId === v.id).length} products</p>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button style={S.ghostBtn} onClick={() => onVendor(v)}>View Profile</button>
                                    <button style={{ ...S.ghostBtn, color: "#e05050", borderColor: "#e05050" }} onClick={() => { if (window.confirm(`Remove ${v.name} from the platform?`)) onReject(v.id); }}>Remove</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── REVIEWS ── */}
            {tab === "reviews" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {myRevs.length === 0
                        ? <p style={{ color: "#4a3a2a", fontFamily: "sans-serif", padding: "20px 0" }}>No reviews yet.</p>
                        : myRevs.map(r => {
                            const prod = products.find(p => p.id === r.productId);
                            return (
                                <div key={r.id} style={{ background: "#fff", border: "2px solid #eee", borderRadius: 10, padding: "16px 18px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                                        <div>
                                            <strong style={{ fontSize: 14, color: "#111" }}>{r.customerName}</strong>
                                            <span style={{ color: "#f59e0b", marginLeft: 10 }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                                            {prod && <p style={{ color: "#16a34a", fontSize: 11, fontFamily: "sans-serif", marginTop: 2 }}>on {prod.name}</p>}
                                        </div>
                                        <span style={{ color: "#888", fontSize: 11, fontFamily: "sans-serif" }}>{new Date(r.date).toLocaleDateString("en-IN")}</span>
                                    </div>
                                    <p style={{ color: "#555", fontSize: 13, fontFamily: "sans-serif", lineHeight: 1.6 }}>{r.comment}</p>
                                </div>
                            );
                        })}
                </div>
            )}
        </div>
    );
}
