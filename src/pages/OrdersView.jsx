import { useState } from "react";
import { S } from "../styles";
import { fmt } from "../utils";
import { STATUS_C } from "../constants";

const STATUS_FLOW = ["confirmed", "preparing", "out for delivery", "delivered"];

export default function OrdersView({ orders, user, isAdmin, isVendor, vendors, products, onStatus, onBack }) {
    const [sel, setSel] = useState(null);

    // ── ORDER DETAIL ──
    if (sel) {
        const o = orders.find(x => x.id === sel);
        if (!o) { setSel(null); return null; }

        return (
            <div style={{ maxWidth: 700, margin: "0 auto", padding: "28px 28px 60px" }}>
                <button style={S.backBtn} onClick={() => setSel(null)}>← Back to Orders</button>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                    <div>
                        <h2 style={S.dashH}>{o.id}</h2>
                        <p style={{ color: "#888", fontSize: 12, fontFamily: "sans-serif" }}>
                            {new Date(o.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                    </div>
                    <span style={{ ...S.statusBadge, background: STATUS_C[o.status] || "#5a4a3a" }}>{o.status}</span>
                </div>

                {/* Status stepper */}
                {o.status !== "cancelled" && (
                    <div style={S.stepper}>
                        {STATUS_FLOW.map((st, i) => (
                            <div key={st} style={{ display: "flex", alignItems: "center", flex: i < STATUS_FLOW.length - 1 ? 1 : undefined }}>
                                <div style={{ ...S.stepDot, ...(STATUS_FLOW.indexOf(o.status) >= i ? S.stepDotOn : {}) }}>
                                    {STATUS_FLOW.indexOf(o.status) > i ? "✓" : ""}
                                </div>
                                <div style={{ flex: 1, textAlign: "center" }}>
                                    <p style={{ color: STATUS_FLOW.indexOf(o.status) >= i ? "#16a34a" : "#bbb", fontSize: 10, fontFamily: "sans-serif", textTransform: "capitalize", marginTop: 6 }}>{st}</p>
                                </div>
                                {i < STATUS_FLOW.length - 1 && <div style={{ ...S.stepLine, ...(STATUS_FLOW.indexOf(o.status) > i ? S.stepLineOn : {}) }} />}
                            </div>
                        ))}
                    </div>
                )}

                {/* Items */}
                <div style={{ background: "#fff", border: "2px solid #111", borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
                    {o.items.map((item, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "14px 18px", borderBottom: i < o.items.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                            <div>
                                <p style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</p>
                                <p style={{ color: "#888", fontSize: 12, fontFamily: "sans-serif" }}>{item.grind} × {item.qty}</p>
                                {isAdmin && vendors[item.vendorId] && (
                                    <p style={{ color: "#c8864a", fontSize: 11, fontFamily: "sans-serif" }}>by {vendors[item.vendorId].name}</p>
                                )}
                            </div>
                            <p style={{ fontWeight: 700, fontFamily: "sans-serif", color: "#111" }}>{fmt(item.unitPrice * item.qty)}</p>
                        </div>
                    ))}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", padding: "0 4px", marginBottom: 20 }}>
                    <span style={{ fontFamily: "sans-serif", fontSize: 15 }}>Total</span>
                    <strong style={{ color: "#111", fontSize: 20 }}>{fmt(o.total)}</strong>
                </div>

                {o.address && (
                    <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "14px 18px", marginBottom: 16 }}>
                        <p style={S.specLbl}>Delivery Details</p>
                        <p style={{ fontSize: 13, fontFamily: "sans-serif", lineHeight: 1.6, color: "#111" }}>{o.address.name} · {o.address.phone}</p>
                        <p style={{ fontSize: 13, fontFamily: "sans-serif", color: "#555" }}>{o.address.line1}{o.address.area ? ", " + o.address.area : ""}, Bengaluru - {o.address.pin}</p>
                    </div>
                )}

                {/* Admin / vendor status actions */}
                {(isAdmin || isVendor) && o.status !== "delivered" && o.status !== "cancelled" && (
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {STATUS_FLOW.slice(STATUS_FLOW.indexOf(o.status) + 1).map(st => (
                            <button key={st} style={S.ctaBtn} onClick={() => { onStatus(o.id, st); setSel(null); }}>
                                Mark: {st.charAt(0).toUpperCase() + st.slice(1)}
                            </button>
                        ))}
                        <button style={{ ...S.ghostBtn, color: "#e05050", borderColor: "#e05050" }} onClick={() => { onStatus(o.id, "cancelled"); setSel(null); }}>
                            Cancel Order
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // ── ORDER LIST ──
    return (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 28px 60px" }}>
            <button style={S.backBtn} onClick={onBack}>← Back</button>
            <h2 style={S.dashH}>{isAdmin ? "All Orders" : isVendor ? "Orders for Your Products" : "My Orders"}</h2>

            {orders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                    <p style={{ fontSize: 36, marginBottom: 12 }}>📦</p>
                    <p style={{ color: "#888", fontFamily: "sans-serif" }}>No orders yet.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {orders.map(o => (
                        <div key={o.id} style={S.orderCard} className="ocard" onClick={() => setSel(o.id)}>
                            <div>
                                <p style={{ fontWeight: 700, fontSize: 14 }}>{o.id}</p>
                                <p style={{ color: "#888", fontSize: 12, fontFamily: "sans-serif" }}>{new Date(o.date).toLocaleDateString("en-IN")} · {o.items.length} item{o.items.length !== 1 ? "s" : ""}</p>
                                {(isAdmin || isVendor) && <p style={{ color: "#888", fontSize: 12, fontFamily: "sans-serif" }}>{o.customerName}</p>}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                <p style={{ fontWeight: 700, fontFamily: "sans-serif", color: "#111" }}>{fmt(o.total)}</p>
                                <span style={{ ...S.statusBadge, background: STATUS_C[o.status] || "#5a4a3a" }}>{o.status}</span>
                                <span style={{ color: "#c8864a", fontSize: 13 }}>→</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
