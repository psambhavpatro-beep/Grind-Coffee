import { S } from "../styles";
import { fmt } from "../utils";
import { GRINDS, DELIVERY_FEE } from "../constants";

export default function CartDrawer({ cart, total, onQty, onRemove, onClose, onCheckout }) {
    const sub = cart.reduce((s, i) => s + i.unitPrice * i.qty, 0);

    return (
        <div style={S.drawerOv} onClick={onClose}>
            <div style={S.drawer} className="drawer-inner" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 700 }}>Cart ({cart.reduce((s, i) => s + i.qty, 0)})</h3>
                    <button style={{ background: "none", border: "none", color: "#888", fontSize: 18, cursor: "pointer" }} onClick={onClose}>✕</button>
                </div>

                {/* Delivery fee note */}
                {cart.length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                        <p style={{ fontSize: 11, fontFamily: "sans-serif", color: "#888", marginBottom: 6 }}>Flat delivery fee: <strong style={{ color: "#1b4332" }}>₹{DELIVERY_FEE}</strong></p>
                    </div>
                )}

                {/* ETA strip */}
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "8px 12px", marginBottom: 14, fontFamily: "sans-serif", fontSize: 12, color: "#166534", display: "flex", alignItems: "center", gap: 8 }}>
                    <span>⚡</span><span><strong>Delivered in 45 min</strong> across Bengaluru</span>
                </div>

                {/* Empty state */}
                {cart.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                        <p style={{ fontSize: 32, marginBottom: 10 }}>☕</p>
                        <p style={{ color: "#4a3a2a", fontFamily: "sans-serif" }}>Your cart is empty.</p>
                    </div>
                ) : (
                    <>
                        {cart.map(i => (
                            <div key={i.key} style={{ display: "flex", gap: 10, padding: "13px 0", borderBottom: "1px solid #160e08" }}>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 600, fontSize: 13 }}>{i.product.name}</p>
                                    <p style={{ color: "#6b7280", fontSize: 11, fontFamily: "sans-serif" }}>
                                        {GRINDS.find(g => g.id === i.grind)?.label}
                                    </p>
                                    <p style={{ color: "#c8864a", fontSize: 12, fontFamily: "sans-serif" }}>{fmt(i.unitPrice)} each</p>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <button style={S.qBtn} onClick={() => onQty(i.key, -1)}>-</button>
                                        <span style={{ fontSize: 13, fontFamily: "sans-serif", minWidth: 16, textAlign: "center" }}>{i.qty}</span>
                                        <button style={S.qBtn} onClick={() => onQty(i.key, 1)}>+</button>
                                    </div>
                                    <p style={{ color: "#c8864a", fontWeight: 700, fontSize: 13, fontFamily: "sans-serif" }}>{fmt(i.unitPrice * i.qty)}</p>
                                    <button style={{ background: "none", border: "none", color: "#3a2010", cursor: "pointer", fontSize: 11 }} onClick={() => onRemove(i.key)}>Remove</button>
                                </div>
                            </div>
                        ))}

                        <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", borderTop: "1px solid #261a10", fontFamily: "sans-serif", marginTop: 4 }}>
                            <span style={{ fontSize: 15 }}>Total</span>
                            <strong style={{ color: "#c8864a", fontSize: 20 }}>{fmt(total)}</strong>
                        </div>
                        <button style={{ ...S.ctaBtn, width: "100%" }} onClick={onCheckout}>Proceed to Checkout</button>
                    </>
                )}
            </div>
        </div>
    );
}
