import { useState } from "react";
import { S } from "../../styles";
import { fmt } from "../../utils";
import { DELIVERY_FEE, FREE_DELIVERY_ABOVE } from "../../constants";

export default function CheckoutModal({ cart, total, user, onPlace, onClose }) {
    const [step, setStep] = useState(1);
    const [addr, setAddr] = useState({ name: user?.name || "", phone: "", line1: "", city: "", state: "Karnataka", pin: "" });

    const sa = (k, v) => setAddr(a => ({ ...a, [k]: v }));
    const deliveryFee = total < FREE_DELIVERY_ABOVE ? DELIVERY_FEE : 0;
    const grandTotal = total + deliveryFee;
    const valid = addr.name && addr.phone && addr.line1 && addr.city && addr.pin;

    return (
        <div style={S.overlay} onClick={onClose}>
            <div style={{ ...S.modal, maxWidth: 480 }} onClick={e => e.stopPropagation()}>
                <button style={S.mClose} onClick={onClose}>✕</button>
                <h2 style={S.mTitle}>Checkout</h2>

                {/* Step indicator */}
                <div style={{ display: "flex", gap: 4, marginBottom: 22 }}>
                    {["Delivery Address", "Review & Pay"].map((lbl, i) => (
                        <div key={i} style={{ flex: 1, textAlign: "center" }}>
                            <div style={{ width: 26, height: 26, borderRadius: "50%", background: step > i + 1 ? "#16a34a" : step === i + 1 ? "#111" : "#f0f0f0", color: step >= i + 1 ? "#fff" : "#bbb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontFamily: "sans-serif", fontWeight: 700, margin: "0 auto 4px" }}>
                                {step > i + 1 ? "✓" : i + 1}
                            </div>
                            <p style={{ fontSize: 10, fontFamily: "sans-serif", color: step === i + 1 ? "#111" : "#bbb", fontWeight: step === i + 1 ? 700 : 400 }}>{lbl}</p>
                        </div>
                    ))}
                </div>

                {/* STEP 1 — Address */}
                {step === 1 && (
                    <div>
                        {[["Full Name", "name", "text"], ["Phone Number", "phone", "tel"], ["Flat / Building / Street", "line1", "text"], ["City", "city", "text"], ["State", "state", "text"], ["PIN Code", "pin", "text"]].map(([lbl, k, type]) => (
                            <div key={k} style={{ marginBottom: 12 }}>
                                <label style={S.fLabel}>{lbl}</label>
                                <input style={S.inp} type={type} value={addr[k]} onChange={e => sa(k, e.target.value)} />
                            </div>
                        ))}
                        <button style={{ ...S.ctaBtn, width: "100%", opacity: valid ? 1 : .38 }} onClick={() => valid && setStep(2)}>
                            Review Order →
                        </button>
                    </div>
                )}

                {/* STEP 2 — Review & Pay */}
                {step === 2 && (
                    <div>
                        <div style={{ background: "#f8f9f5", border: "1px solid #e5e5e5", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontFamily: "sans-serif", fontSize: 13 }}>
                            <p style={{ fontWeight: 700, color: "#111", marginBottom: 3 }}>📍 Delivering to</p>
                            <p style={{ color: "#555" }}>{addr.name} · {addr.phone}</p>
                            <p style={{ color: "#555" }}>{addr.line1}, {addr.city}, {addr.state} - {addr.pin}</p>
                            <button style={{ background: "none", border: "none", color: "#16a34a", cursor: "pointer", fontSize: 11, marginTop: 4, fontWeight: 700, padding: 0 }} onClick={() => setStep(1)}>Edit address</button>
                        </div>

                        {cart.map(i => (
                            <div key={i.key} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #f0f0f0" }}>
                                <div>
                                    <p style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{i.product.name}</p>
                                    <p style={{ color: "#888", fontSize: 11, fontFamily: "sans-serif" }}>{i.grind} × {i.qty}</p>
                                </div>
                                <p style={{ fontWeight: 700, fontFamily: "sans-serif", color: "#111" }}>{fmt(i.unitPrice * i.qty)}</p>
                            </div>
                        ))}

                        <div style={{ marginTop: 12, borderTop: "2px solid #111", paddingTop: 12 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontFamily: "sans-serif", fontSize: 13 }}>
                                <span style={{ color: "#888" }}>Subtotal</span><span>{fmt(total)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontFamily: "sans-serif", fontSize: 13 }}>
                                <span style={{ color: "#888" }}>Delivery fee</span>
                                {deliveryFee === 0
                                    ? <span style={{ color: "#16a34a", fontWeight: 700 }}>FREE ✓</span>
                                    : <span>{fmt(deliveryFee)}</span>}
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "sans-serif" }}>
                                <span style={{ fontWeight: 700, fontSize: 15 }}>Total</span>
                                <strong style={{ fontSize: 20, color: "#111" }}>{fmt(grandTotal)}</strong>
                            </div>
                            {deliveryFee > 0 && (
                                <p style={{ fontSize: 11, color: "#888", fontFamily: "sans-serif", marginTop: 4 }}>
                                    Add {fmt(FREE_DELIVERY_ABOVE - total)} more for free delivery
                                </p>
                            )}
                        </div>

                        <button style={{ ...S.ctaBtn, width: "100%", marginTop: 16 }} onClick={() => onPlace(addr)}>
                            Place Order · {fmt(grandTotal)} →
                        </button>
                        <p style={{ textAlign: "center", fontSize: 11, color: "#999", fontFamily: "sans-serif", marginTop: 10 }}>
                            Cash on delivery · UPI / Card at door
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
